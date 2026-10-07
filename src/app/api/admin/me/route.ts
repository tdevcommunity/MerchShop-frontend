import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/admin-session";

/**
 * Le compte connecte.
 *
 * L'ecran s'en sert pour savoir ou il en est — afficher « Ama Koffi » ou un
 * lien vers la connexion — et non pour decider ce qu'il a le droit de voir.
 *
 * La distinction compte. Un garde d'ecran qui teste le role ici afficherait un
 * lien vers le journal d'audit, mais la page derriere refuserait la requete : le
 * bouton serait la et ne fonctionnerait pas, ce qui est pire que de ne pas
 * l'afficher, parce que l'utilisateur perdrait le temps a cliquer pour decouvrir
 * un refus. Les ecrans qui filtrent des actions le font donc sur la reponse de
 * la page concernee, ou sur ce que l'API renvoie sur cette page — la ou la
 * reponse decrit des droits reels.
 */
export async function GET(request: Request) {
  const auth = await requireAdmin(request);

  if (auth.error) {
    return auth.error;
  }

  return NextResponse.json(auth.user);
}
