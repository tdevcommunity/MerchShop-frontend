# Clean Architecture — Laravel / DRF / Spring Boot

## Laravel

- **Contrôleurs** fins : reçoivent la requête (validée par un Form Request), délèguent à un Service/Action, retournent une Resource/réponse.
- **Services/Actions** (`app/Services/`, ou pattern "Action" une classe = un cas d'usage) : logique métier, orchestrent les Repositories/Models.
- **Repositories** (optionnel mais recommandé au-delà d'un CRUD simple) : interface + implémentation Eloquent, pour pouvoir substituer la source de données sans toucher au métier.
- **Models Eloquent** : représentation de la persistance — éviter d'y empiler de la logique métier complexe au-delà des relations et accessors/mutators simples ; la logique métier substantielle va dans les Services.
- **API Resources** (`JsonResource`) pour la couche présentation, jamais de retour direct du Model brut sur une API publique.

## Django REST Framework

- **Vues/ViewSets** fins : délèguent la validation au Serializer, la logique métier à une couche service (`services.py` par app, ou classe dédiée) plutôt que de tout empiler dans `perform_create`/`perform_update`.
- **Serializers** : validation et (de)sérialisation — éviter d'y mettre de la logique métier lourde (side-effects), qui doit vivre dans la couche service.
- **Services** (`app/services.py` ou `app/domain/`) : logique métier pure, orchestrent les querysets/models.
- **Models Django** : persistance ; les `manager`/`queryset` custom pour les requêtes réutilisables, la logique métier substantielle reste hors du Model.

## Spring Boot

- **Controller** : reçoit/valide (`@Valid` + DTO), délègue au Service, retourne un DTO de réponse — jamais l'entité JPA directement sur l'API.
- **Service** (`@Service`) : logique métier, orchestre les Repository ; interfaces de Service si plusieurs implémentations sont probables (respect du D de SOLID).
- **Repository** (`@Repository`, Spring Data JPA) : accès aux données uniquement.
- **Entity** (`@Entity`) : persistance JPA ; garder les entités focalisées sur la structure de données, la logique métier substantielle va dans le Service.
- **DTO** dédiés pour les couches entrée/sortie de l'API, distincts des entités JPA, pour ne jamais exposer directement le modèle de persistance ni ses relations lazy.

## Principe commun

Dans les trois frameworks, la couche "contrôleur/vue" ne doit jamais contenir de requête DB directe ni de règle métier substantielle — elle traduit la requête HTTP vers un appel de service et le résultat vers une réponse. C'est le service qui porte la responsabilité métier et qui reste testable indépendamment du framework web (voir `tests-dev`).
