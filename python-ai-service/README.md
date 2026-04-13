# Min-shop Python AI Service

Microservice Python dedie a l assistant IA de Min-shop.

Il fournit :
- une recherche produit semantique
- une classification d intention simple
- un reranking metier
- une reponse structuree prete a afficher dans l app principale

Le service n entraine aucun gros modele from scratch. Il utilise une base pragmatique et evolutive avec embeddings textuels TF-IDF, heuristiques produit, et architecture modulaire.

## Structure

```text
python-ai-service/
  app/
    main.py
    api/
      routes.py
    core/
      config.py
    models/
      schemas.py
    services/
      embedding_service.py
      intent_service.py
      parser_service.py
      ranking_service.py
      search_service.py
    data/
      mock_products.py
    utils/
      text.py
  requirements.txt
  README.md
```

## Installation

```bash
cd python-ai-service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

## Lancement

```bash
uvicorn app.main:app --reload --port 8010
```

Base URL locale :

```text
http://127.0.0.1:8010
```

## Endpoints

### POST /health

Verifie que le service repond et indique l etat des composants principaux.

Exemple :

```json
{}
```

### POST /embed-products

Charge un catalogue externe ou reconstruit l index du catalogue mock.

Exemple avec catalogue externe :

```json
{
  "products": [
    {
      "id": "p1",
      "title": "Telephone 4G compact",
      "description": "Telephone abordable pour etudiants",
      "category": "telephone",
      "price": 55000,
      "region": "Yaounde",
      "availability": 18,
      "popularity": 0.82,
      "trust_score": 88,
      "trust_status": "valid",
      "tags": ["android", "budget", "etudiant"]
    }
  ]
}
```

Exemple en mode mock :

```json
{}
```

### POST /classify-intent

Detecte l intention principale et renvoie un score de confiance.

Exemple :

```json
{
  "query": "Je cherche un telephone pas cher a Yaounde"
}
```

### POST /search

Recherche les produits reels les plus pertinents a partir de la requete, puis applique le reranking metier.

Exemple :

```json
{
  "query": "Je veux un telephone pas cher a Yaounde",
  "top_k": 5
}
```

## Exemple de reponse /search

```json
{
  "intent": {
    "label": "product_search",
    "confidence": 0.93
  },
  "filters": {
    "category": "telephone",
    "region": "yaounde",
    "budget": {
      "label": "low",
      "max_price": 75000
    },
    "need": "pas cher",
    "audience": null
  },
  "products": [
    {
      "id": "ph-001",
      "title": "Smartphone 4G Endurance A12",
      "category": "telephone",
      "price": 69000.0,
      "region": "Yaounde",
      "availability": 22,
      "trust_score": 89.0,
      "trust_status": "valid",
      "semantic_score": 0.71,
      "business_score": 0.83,
      "final_score": 0.76,
      "justification": "Bon match sur la categorie telephone, le besoin budget et la region Yaounde."
    }
  ],
  "message": "J ai trouve 1 produit pertinent pour votre recherche a Yaounde.",
  "total_found": 1
}
```

## Choix d implementation

- Embeddings :
  le service utilise `TfidfVectorizer` comme base d embeddings texte legere et stable. Cela permet un MVP rapide, testable et remplacable plus tard par un vrai provider d embeddings.
- Intent classification :
  implementation par regles et heuristiques, avec scores lisibles.
- Ranking metier :
  combinaison entre similarite semantique et signaux business :
  - confiance listing
  - stock
  - popularite
  - adequation region
  - adequation budget
- Catalogue :
  le service peut fonctionner sans branchement externe grace a un catalogue mock integre.

## Integration avec Min-shop

Le frontend ou le backend principal peut appeler :

- `POST /classify-intent` pour router la requete
- `POST /search` pour alimenter l assistant IA
- `POST /embed-products` lorsqu un nouveau catalogue doit etre charge

## Notes

- Le service n invente jamais de produit absent.
- Les reponses sont construites uniquement a partir des resultats reellement trouves.
- Le modele d embeddings peut etre remplace plus tard sans casser l API grace a `EmbeddingService`.
