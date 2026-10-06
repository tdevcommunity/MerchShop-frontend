import { NextResponse } from "next/server";
import { laravelFetch, LaravelError } from "@/server/laravel";

/**
 * La session d'administration.
 *
 * Elle est demandee a l'API et nulle part ailleurs. Le back-office ne tient pas
 * de copie : une copie serait une deuxieme source de verite sur « qui est
 * connecte », et les deux sources finissent par diverger — typiquement le temps
 * que la session de l'API expire pendant que la copie locale, elle, tient
 * encore, et qu'un guichetier decouvre en revenant d'une pause que son acces
 * est coupe sans avoir rien fait.
 *
 * `UserResource` est la seule source, pour la meme raison que les statuts :
 * une valeur reecrite par le front finit par dire autre chose que la base.
 */

/** Ce que l'ecran sait faire de l'utilisateur connecte. */
export type AdminSessionUser = {
  uuid: string;
  email: string;
  fullName: string;
  role: AdminRole;
  active: boolean;
};

/** Les deux roles qui entrent dans le back-office. */
export type AdminRole = "admin" | "staff";

/** La reponse de `GET /api/v1/auth/me`. */
type AuthUser = {
  uuid?: string;
  email?: string;
  firstname?: string;
  lastname?: string;
  role?: string;
  status?: number;
};

/**
 * `active` est calcule ici et non lu.
 *
 * L'API expose `status`, qui est un entier de sa nomenclature ; le front a besoin
 * de la question posee — « ce compte peut-il travailler ? » — et non du chiffre.
 * Poser la conversion ici, une fois, evite qu'un ecran teste `status === 1` et
 * qu'un autre teste `status === ACTIVE`, dont un des deux sera faux le jour ou
 * la nomenclature gagne une valeur.
 */
function toSessionUser(user: AuthUser): AdminSessionUser | null {
  if (
    !user.uuid ||
    !user.email ||
    (user.role !== "admin" && user.role !== "staff")
  ) {
    return null;
  }

  return {
    uuid: user.uuid,
    email: user.email,
    fullName: [user.firstname, user.lastname].filter(Boolean).join(" "),
    role: user.role,
    active: user.status === 1,
  };
}

/**
 * Le compte connecte, ou une reponse d'echec.
 *
 * Deux refus distincts, parce qu'ils relevent de deux problemes differents et
 * que l'ecran doit les traiter differemment : pas de session du tout, c'est
 * une invitation a se connecter ; une session qui n'a pas le role, c'est une
 * page a quitter sans formulaire.
 *
 * Le second ne peut pas se contenter d'un 403 : un client conduit par une
 * session expiree ne peut pas distinguer « deconnecte » de « pas autorise », et
 * afficherait « acces refuse » a quelqu'un dont le session a simplement rendu
 * l'ame. Le 401 est donc rendu tel quel, et c'est lui qui redirige vers la
 * connexion.
 */
export async function requireAdmin(request: Request): Promise<
  | { user: AdminSessionUser; error?: never }
  | { user?: never; error: NextResponse }
> {
  let user: AdminSessionUser | null;

  try {
    user = toSessionUser(
      await laravelFetch<AuthUser>(request, "/api/v1/auth/me"),
    );
  } catch (error) {
    return { error: refused(error) };
  }

  if (!user) {
    return { error: unauthenticated() };
  }

  /*
   * Le role est verifie ici et non par le middleware, parce que ce n'est pas la
   * meme question. Une session ouverte par un client est parfaitement valide —
   * il achete au festival comme tout le monde — et c'est bien parce qu'elle est
   * valide que la distinction porte sur le role.
   *
   * Un compte desactive est refuse, lui, alors que son role porterait. C'est
   * l'activite qui coupe un acces, immediatement, sans avoir a desactiver
   * cinquante comptes un par un.
   */
  if (!user.active) {
    return {
      error: NextResponse.json(
        { message: "Ce compte est désactivé." },
        { status: 403 },
      ),
    };
  }

  return { user };
}

export function unauthenticated(): NextResponse {
  return NextResponse.json(
    { message: "Authentification requise." },
    { status: 401 },
  );
}

/**
 * Traduit un refus de l'API en reponse pour le navigateur.
 *
 * Le statut et le message de l'API sont conserves : les reduire a « 400 » ferait
 * perdre au guichetier la raison reelle — un role insuffisant se lit d'un coup,
 * une session expiree se reconnait immediatement, et une erreur de validation
 * doit nommer le champ. Un message unique « impossible » pour les trois
 * supprimerait exactement l'information qui fait agir.
 */
function refused(error: unknown): NextResponse {
  if (error instanceof LaravelError) {
    return NextResponse.json(
      {
        message: error.message,
        code: error.code,
        details: error.details,
      },
      { status: error.status },
    );
  }

  return NextResponse.json(
    { message: "Le serveur n'a pas pu traiter la demande." },
    { status: 502 },
  );
}

/**
 * La meme traduction, pour une route d'action.
 *
 * Distincte de `refused` parce qu'elle n'a pas d'autre etat a rendre : une route
 * d'action ne rend pas de compte connecte, elle rend une reponse ou une erreur,
 * et le type de retour ne doit pas obliger l'appelant a tester un `error` qui
 * n'existe pas.
 */
export function laravelErrorResponse(error: unknown): NextResponse {
  return refused(error);
}
