# Plan de tracking & analytics — TDEV Festival

Source : Data Tracking Plan & Analytics Specification v1.0.0 (AMOUZOU-ABLO Cédric Jean-Marc, Lead Data, Analytics & Sync). Ce document résume les règles à respecter par le code, pas la totalité de la spécification métier — se référer au document source pour le détail complet si besoin.

## Principe général

On collecte d'abord les **données brutes** (raw data). Les KPI et dashboards sont calculés ensuite à partir de ces données — ne jamais implémenter uniquement un compteur/agrégat sans conserver l'événement brut qui l'a produit.

Pour chaque événement important, conserver : Qui ? Quoi ? Quand ? Où ? Dans quel contexte ? Depuis quel appareil ? Avec quel résultat ? Avec quelles propriétés associées ?

## Identifiants à conserver et relier

| Identifiant | Utilité |
|---|---|
| `participant_id` | Identifier un participant de manière stable |
| `ticket_id` | Identifier son pass |
| `order_id` | Identifier une commande Shop |
| `product_id` / `product_variant_id` | Identifier un produit / sa variante (taille, couleur) |
| `payment_id` | Identifier une transaction |
| `scan_id` | Identifier chaque opération de scan |
| `session_id` | Identifier une session web/app |
| `device_id` | Identifier le terminal utilisé |
| `staff_id` | Identifier l'agent ayant effectué le scan |
| `event_id` | Identifier l'événement/l'édition |

Le lien `participant_id` ↔ `ticket_id` ↔ `order_id` est particulièrement important pour croiser billetterie et Shop — s'assurer que le schéma de données permet cette jointure sans ambiguïté.

## QR Code : un seul par participant

Un seul QR par participant, réutilisé à tous les points de contrôle (entrée, Free Food, retrait goodies, After) — **ne jamais générer un QR différent pour l'After**. Chaque scan est un événement analytique distinct, pas une simple vérification d'état.

### Trois types de droits

| | STANDARD | STANDARD + Goodies | VIP + Goodies |
|---|---|---|---|
| `access_event` | true | true | true |
| `access_food` | true | true | true |
| `has_merch` | false | true | true |
| `access_after` | false | false | true |
| `order_id` requis | non | oui | oui |

### Contenu du QR

- Payload logique minimal : `ticket_id`, `participant_id`, `event_id`, `pass_type`, `qr_version`, `issued_at`, `security_signature`.
- Les droits détaillés (`access_event`, `access_food`, `access_after`, `has_merch`, `order_id`, `merch_items`, `ticket_options`, `ticket_status`) sont récupérés côté serveur à partir du `ticket_id`/`participant_id` — pas nécessairement encodés en clair dans le QR.
- Billetterie : QR sécurisé par signature cryptographique/HMAC. Shop : QR de retrait sécurisé par hash, associé à `order_id` (voir aussi §8 Sécurité du `SKILL.md` principal).

## Événement central : `ticket_scanned`

Chaque scan est enregistré indépendamment, jamais comme un simple remplacement d'état (`participant = présent`). Propriétés minimales à conserver par scan :

```
scan_id, ticket_id, participant_id, scan_time, scan_type, scan_location,
staff_id, device_id, connection_status, scan_result, previous_scan,
pass_type, access_after
```

### Types de scans (`scan_type`)

- `EVENT_ENTRY` — entrée festival
- `FOOD_ACCESS` — Free Food
- `MERCH_PICKUP` — retrait goodies
- `AFTER_ENTRY` — entrée After (même QR, événement distinct du premier accès)

### Résultats de scan (`scan_result`) — tous à conserver, pas seulement les valides

`VALID`, `ALREADY_SCANNED`, `INVALID`, `NOT_AUTHORIZED`, `EXPIRED`. Pour un scan refusé, conserver si disponible : `reason`, `previous_scan_time`, `previous_scan_location`, `previous_scan_staff`.

## Deux règles de modélisation non négociables

1. **Ne pas écraser l'historique.** Quand une donnée change (ex. upgrade Standard → VIP), conserver la séquence d'événements (`ticket_created`, `ticket_upgraded`, `ticket_updated`) plutôt que de ne garder que la valeur finale. S'applique à tout changement de statut métier significatif (pass, commande, paiement).
2. **Distinguer droit et utilisation.** `access_after = true` et `after_entry = false` signifie que le participant avait le droit mais ne l'a pas utilisé — ne jamais fusionner ces deux notions dans un seul champ booléen. S'applique en particulier à Food, Goodies (`has_merch` vs `merch_pickup`) et After (`access_after` vs `after_entry`).

## Domaines de données à couvrir

- **Billetterie** : `ticket_id`, `participant_id`, `pass_type`, `ticket_price`, `purchase_time`, `payment_status`, `payment_method`, `source`, `campaign`, droits (`access_*`), `ticket_status`.
- **Options/droits** : `option_id`, `option_name`, `option_type`, `option_price`, `purchase_status`, reliés à `participant_id`/`ticket_id`.
- **Shop/commande** : `order_id`, `order_status`, `payment_status`, `total_amount`, `fulfillment_method`, `pickup_status`, `pickup_time` ; par produit : `product_id`, `product_variant`, `size`, `color`, `quantity`, `unit_price`.
- **Paiement** : `payment_id`, `order_id`, `amount`, `payment_method`, `payment_provider`, `payment_status`, timestamps de création/complétion/échec, `failure_reason`. Fournisseurs prévus : FedaPay, KKiaPay, PayGate, Flooz/T-Money.
- **Acquisition** : `source`, `utm_source/medium/campaign/content/term`, `referrer`, `landing_page`.
- **Comportement web/app** : `page_viewed`, `product_viewed`, `product_added_to_cart`, `checkout_started`, `checkout_abandoned`, `payment_started/completed/failed`, `ticket_downloaded/opened` — chaque événement avec `event_name`, `event_time`, `participant_id`, `session_id`, `device_type`, `browser`, `os`.
- **Technique** : `device_type`, `device_model`, `os`, `app_version`, `connection_status`, `online_offline`, `sync_status` — l'application de scan doit fonctionner offline avec synchronisation ultérieure.
- **Synchronisation** : pour tout événement issu d'un terminal, conserver `created_at` (heure réelle), `received_at` (réception serveur), `synced_at`, `sync_status`, `sync_attempt_count`, `sync_delay` — distinguer explicitement ces trois horodatages, en particulier en contexte offline.
- **Qualité** : conserver aussi les échecs (`scan_invalid`, `scan_duplicate`, `payment_failed`, `sync_conflict`, `api_error`...) — un système qui ne logue que les succès donne une vision incomplète.

## Priorités de collecte

- **P1 (obligatoire)** : participant, ticket, pass, droits, commande, produits, paiement, scans, zone, heure, résultat du scan, Food, retrait goodies, After.
- **P2 (fortement recommandée)** : source, campagne, device, staff, terminal, statut online/offline, synchronisation, checkout, comportement.
- **P3 (opportuniste, si peu coûteux)** : taille d'écran, temps de session, temps de synchronisation, nombre de tentatives.

En cas d'arbitrage de temps de développement, ne jamais sacrifier une donnée P1 pour implémenter une donnée P2/P3.

## Ce que ce document ne fixe pas

La structure exacte des tables, les endpoints, le système d'événements, le stockage, la synchronisation et le format technique du QR restent au choix des développeurs (voir `SKILL.md` §3-6 pour les conventions de nommage à appliquer à ces choix) — seules les informations elles-mêmes doivent rester accessibles, cohérentes, historisées et exploitables.
