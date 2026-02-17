movies_metadata.csv
- id
- title
- overview
- release_date
- runtime
- budget
- revenue
- genres (JSON)

credits.csv
- cast (JSON → actors)
- crew (JSON → directors)


Entities:
- Movie
- Genre
- Actor
- Director

Relationships:
- Movie ↔ Genre (M:N)
- Movie ↔ Actor (M:N)
- Movie ↔ Director (M:N)
