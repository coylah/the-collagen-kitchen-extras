## Goal
Pull all recipes from the original "Collagen Cookbook Creator" project into this remix's database so the Recipes, Favourites, Planner, and Shopping pages have content again.

## How it works
The original project's `recipes` table has a public read policy, so I can fetch every row using its anon key (no credentials needed from you) and insert the same rows into this project's `recipes` table. The schema in both projects is identical, so this is a straight 1:1 copy — same `id`, `slug`, `name`, `ingredients`, `method`, `image_url`, etc. Nothing in the original project gets touched.

## Steps
1. Fetch all rows from the original project's `recipes` table (paginated REST call against its public Data API).
2. Save the JSON locally so we have a backup file in `/mnt/documents/recipes-backup.json`.
3. Insert all rows into this project's `recipes` table in batches via a data-change migration, preserving original `id` and `slug` values so any existing favourites/planner entries in localStorage keep working.
4. Verify the row count matches (expecting ~47) and load `/` in the preview to confirm recipes render.

## Out of scope
- No schema changes — the `recipes` table already exists with the right shape.
- No code changes — this is purely a data copy.
- No changes to the original project.
