Entity Relationship Design

movies

movie_id (PK)

title

overview

release_date

runtime

budget

revenue

genres

genre_id (PK)

name

actors

actor_id (PK)

name

directors

director_id (PK)

name

movie_genres

movie_id (FK → movies.movie_id)

genre_id (FK → genres.genre_id)

Composite PK: (movie_id, genre_id)

movie_actors

movie_id (FK → movies.movie_id)

actor_id (FK → actors.actor_id)

Composite PK: (movie_id, actor_id)

movie_directors

movie_id (FK → movies.movie_id)

director_id (FK → directors.director_id)

Composite PK: (movie_id, director_id)

Relationships:

- movies ↔ genres (many-to-many via movie_genres)
- movies ↔ actors (many-to-many via movie_actors)
- movies ↔ directors (many-to-many via movie_directors)
