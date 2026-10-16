---
name: design-humain
description: "Règles concrètes anti-patterns pour tout travail de design visuel d'application (web, mobile, desktop) réalisé par un agent IA — bannit les dégradés décoratifs génériques, les effets visuels trop 'tendance' (glassmorphism, neumorphism, glow, animations gratuites), les boutons trop arrondis par défaut, et tout autre tic reconnaissable comme 'généré par IA'. À utiliser sur toute tâche de conception ou de revue d'interface, en complément de frontend-design qui fournit le processus complet — ce skill fournit les interdits précis et chiffrés."
---

# Design humain — interdits précis et principes

Ce skill ne remplace pas un skill de processus de design complet (`frontend-design` pour la démarche : ancrage dans le sujet, système de tokens, typographie, retenue) : il fournit une liste **précise, concrète et vérifiable** d'interdits et de règles chiffrées pour le design d'application. Là où `frontend-design` explique la démarche, celui-ci donne les seuils et les non-négociables qui permettent de vérifier un rendu objectivement.

## Principe directeur

**Un design humain a une raison pour chaque choix.** Un designer qui a fait ce travail depuis 10 ans n'ajoute pas un dégradé "parce que ça fait moderne" — il l'ajoute (ou pas) parce que le contenu, la marque ou l'usage l'exige. Si un effet ne peut pas être justifié par une raison spécifique à ce projet, il ne doit pas être là. Le test à appliquer à chaque élément décoratif : "si je retire ça, est-ce que quelque chose de réel est perdu ?" Si la réponse est non, le retirer.

## Interdits absolus

### Dégradés

- **Aucun dégradé décoratif par défaut** : pas de fond en `linear-gradient`/`radial-gradient` multicolore, pas de "aura"/halo lumineux flouté derrière un titre ou une image, pas de texte en dégradé (`background-clip: text`), pas de bouton avec un fond en dégradé.
- Un dégradé n'est acceptable que s'il sert une fonction précise et unique dans tout le design (ex. un unique gradient très subtil, deux tons proches, pour suggérer une profondeur de ciel/eau sur UN visuel spécifique lié au sujet) — jamais comme habillage systématique de boutons, cartes, fonds de section.
- Si un dégradé est utilisé, il ne doit apparaître **qu'à un seul endroit** dans tout le design. Un dégradé répété sur plusieurs composants est toujours un tic, jamais un choix.

### Effets "trop tendance"

- **Glassmorphism** (cartes en verre flouté, `backdrop-filter: blur()`, bordures translucides) : proscrit par défaut. C'est un effet de mode daté et immédiatement reconnaissable ; ne l'utiliser que si explicitement demandé.
- **Neumorphism** (ombres doubles claire/sombre simulant un relief mou) : proscrit, illisible et daté.
- **Glow/néon** (ombre portée colorée floue autour d'un texte ou d'un bouton pour simuler une lueur) : proscrit.
- **Ombres portées génériques répétées** : pas la même ombre grise douce (`rgba(0,0,0,.1)` ou équivalent) sous chaque carte/bouton/image du design. Une ombre, si utilisée, a une valeur choisie pour ce design et n'est pas appliquée mécaniquement à tout ce qui ressemble à un conteneur.
- **Animations et micro-interactions gratuites** : pas de fade-in/slide-up systématique sur chaque section au scroll, pas d'effet de rebond (`bounce`) ou de scale au survol sur chaque carte/bouton, pas de particules, confettis, ou décor animé en fond. Une animation doit répondre à une action de l'utilisateur ou marquer un unique moment fort du parcours — jamais un tic répété sur chaque élément.
- **Effets 3D gratuits** (cartes qui pivotent en perspective au survol, éléments qui flottent avec une ombre exagérée) : proscrits sauf demande explicite et justification claire par le sujet.

### Boutons et composants

- **Pas de `border-radius` en pilule par défaut** (`border-radius: 9999px` ou équivalent "totalement arrondi") sur les boutons. C'est devenu un réflexe systématique alors que ce n'est un bon choix que pour certaines identités (ludique, très casual) — pour la majorité des contextes, préférer un radius modéré et cohérent avec le reste du design :
  - Design éditorial/sobre : `0-4px`.
  - Design produit/SaaS standard : `4-8px`.
  - Pilule (`9999px`) réservée aux cas où c'est un choix de marque assumé et répété consciemment, jamais un réglage par défaut non réfléchi.
- **Un seul radius dans tout le design**, appliqué avec cohérence (boutons, cartes, champs de formulaire partagent la même valeur ou une échelle délibérée à 2 valeurs maximum) — pas un radius différent sur chaque composant par accident.
- Pas de bouton avec plusieurs effets cumulés (dégradé + ombre + glow + radius pilule) : chaque effet cumulé ajoute un tic reconnaissable ; un bouton réussi est le plus souvent une couleur plate, un texte net, un radius sobre, et un seul état de survol discret (changement de teinte ou de contraste, pas de mouvement).

### Autres tics à bannir

- Pas de barre ou liseré de couleur décoratif (soulignement de titre, bande verticale sur le bord d'une carte, bordure sur un seul côté) utilisé comme motif de séparation — utiliser l'espace blanc ou une teinte de fond.
- Pas d'étiquette en petites majuscules espacées ("EYEBROW LABEL") au-dessus de chaque titre par réflexe.
- Pas de flèche `→` accolée systématiquement à chaque lien ou bouton.
- Pas d'icône dans un cercle coloré répétée identiquement sur chaque bloc de contenu.
- Pas de fond crème/beige (`#F5F5DC`, `#FAF0E6`, proches de `#F4F1EA`) choisi par défaut faute d'autre idée — c'est devenu aussi reconnaissable qu'un template.

## Principes positifs

- **Un seul geste audacieux, le reste discret.** Choisir un élément qui porte la personnalité du design (une typographie de titre marquante, une composition asymétrique, une couleur d'accent unique) et garder tout le reste sobre autour. Cumuler plusieurs effets "audacieux" annule l'effet recherché et lit comme un manque de direction.
- **Variation plutôt que système mécanique.** Un humain qui compose plusieurs écrans/slides/pages ne répète jamais exactement le même squelette : il varie consciemment la densité, l'alignement, la taille des éléments d'un écran à l'autre tout en gardant une cohérence de palette et de typographie.
- **Contraste et lisibilité d'abord.** Aucun effet esthétique ne justifie un texte à faible contraste, un bouton dont l'état n'est pas clair, ou une hiérarchie visuelle ambiguë.
- **La couleur a une raison.** Une palette choisie pour CE projet précis, pas la palette "qui marche toujours" — si les mêmes couleurs conviendraient à n'importe quel autre projet, elles ne sont pas assez spécifiques.

## Checklist de vérification avant de livrer

- [ ] Aucun dégradé décoratif, ou un seul dégradé utilisé à un seul endroit avec une raison précise
- [ ] Aucun glassmorphism, neumorphism, glow/néon
- [ ] Aucune ombre portée générique répétée mécaniquement sur tous les conteneurs
- [ ] Aucune animation/micro-interaction répétée sur chaque carte/section sans lien avec une action utilisateur
- [ ] Un seul radius (ou une échelle délibérée à 2 valeurs), jamais de pilule par défaut non réfléchie
- [ ] Aucun bouton ne cumule plus de deux effets (couleur + un seul de : ombre légère, changement d'état au survol)
- [ ] Aucune barre/liseré d'accent décoratif, aucune flèche systématique sur les liens, aucune étiquette majuscule par réflexe
- [ ] La palette est spécifique au projet — le test "cette palette irait sur n'importe quel autre projet" échoue
- [ ] Au moins un élément du design porte une décision délibérée et reconnaissable comme faite *pour ce projet*, pas comme un réglage par défaut

## Combiner avec le skill de design de processus

Utiliser `frontend-design` pour le processus complet (ancrage dans le sujet, système de tokens, typographie, retenue) — ce skill-ci s'applique par-dessus pour verrouiller les interdits chiffrés. Si `frontend-design` n'est pas disponible, ce skill reste utilisable seul comme garde-fou minimal.
