# Tests — Laravel / DRF / Spring Boot

## Laravel (PHPUnit / Pest)

- Pest en priorité si le projet l'utilise déjà (syntaxe plus concise), sinon PHPUnit standard — ne pas mélanger les deux styles dans un même projet sans raison.
- Tests de Feature (`tests/Feature/`) pour les endpoints (requête HTTP simulée via `$this->postJson(...)`, assertions sur le statut et le payload) ; tests Unit (`tests/Unit/`) pour la logique isolée d'un Service/Action.
- `RefreshDatabase` (ou `DatabaseTransactions`) sur les tests touchant la DB pour garantir l'isolation entre tests.
- Factories Eloquent (`Model::factory()`) pour générer les données de test plutôt que de l'insertion manuelle répétée.
- Mock des dépendances externes (mail, queue, appels HTTP tiers) via les fakes Laravel (`Mail::fake()`, `Http::fake()`, `Queue::fake()`).

## Django REST Framework (pytest)

- `pytest-django` + `APIClient`/`APITestCase` pour les tests d'endpoints (statut, structure du payload de réponse).
- `factory_boy` pour générer les objets de test plutôt que des fixtures JSON statiques difficiles à maintenir.
- Isolation DB assurée par la fixture `db`/`django_db` de pytest-django (transaction annulée après chaque test).
- Mock des appels externes avec `unittest.mock`/`pytest-mock` ; ne jamais laisser un test appeler un service tiers réel.

## Spring Boot (JUnit 5 / Mockito)

- `@SpringBootTest` pour les tests d'intégration (contexte Spring complet) ; `@WebMvcTest` pour tester un Controller isolément (avec `MockMvc`) sans charger toute l'application ; `@DataJpaTest` pour tester un Repository avec une DB embarquée.
- Mockito (`@Mock`, `@InjectMocks`) pour isoler un Service de ses dépendances dans un test unitaire pur.
- `Testcontainers` recommandé pour les tests d'intégration nécessitant une vraie instance PostgreSQL/MySQL plutôt qu'une base embarquée qui masquerait des différences de comportement SQL.
