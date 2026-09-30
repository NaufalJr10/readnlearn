-- Generated tsvector columns confuse Prisma's diffing; expression indexes are invisible to it.
-- Queries must use the exact same expressions (see src/lib/search.ts).
DROP INDEX IF EXISTS "courses_search_vector_idx";
DROP INDEX IF EXISTS "tutors_search_vector_idx";
ALTER TABLE "courses" DROP COLUMN "search_vector";
ALTER TABLE "tutors" DROP COLUMN "search_vector";

CREATE INDEX "courses_fts_idx" ON "courses" USING GIN ((
  setweight(to_tsvector('english', coalesce("title", '')), 'A') ||
  setweight(to_tsvector('english', coalesce("subject", '')), 'B') ||
  setweight(to_tsvector('english', coalesce("description", '')), 'C')
));
CREATE INDEX "tutors_fts_idx" ON "tutors" USING GIN ((to_tsvector('english', coalesce("bio", ''))));
