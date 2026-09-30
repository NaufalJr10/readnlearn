import { UserSearch } from "lucide-react";
import type { Metadata } from "next";
import { FilterBar } from "@/components/catalog/FilterBar";
import { Pagination } from "@/components/catalog/Pagination";
import { TutorCard } from "@/components/catalog/TutorCard";
import { PageHeader } from "@/components/site/PageHeader";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { EmptyState } from "@/components/ui/EmptyState";
import { listSpecialties, PAGE_SIZE, searchTutors, type TutorFilters } from "@/lib/catalog";

export const metadata: Metadata = { title: "Find a tutor", description: "Browse expert tutors by specialty and rating." };

function pick(params: Record<string, string | string[] | undefined>): TutorFilters {
  const get = (key: string) => (typeof params[key] === "string" ? (params[key] as string) : undefined);
  return { q: get("q"), specialty: get("specialty"), minRating: get("minRating"), sort: get("sort"), page: get("page") };
}

export default async function TutorsPage({ searchParams }: PageProps<"/tutors">) {
  const filters = pick(await searchParams);
  const [{ tutors, total, page }, specialties] = await Promise.all([searchTutors(filters), listSpecialties()]);

  return (
    <>
      <PageHeader eyebrow="Tutor directory" title="Meet tutors who make it click" description="Every tutor is reviewed by our team before they can teach on ReadnLearn.">
        <FilterBar
          searchLabel="Search tutors"
          searchPlaceholder="Search by name, subject or specialty"
          filters={[
            { name: "specialty", label: "Specialty", options: [{ value: "", label: "All specialties" }, ...specialties.map((s) => ({ value: s, label: s }))] },
            {
              name: "minRating",
              label: "Rating",
              options: [
                { value: "", label: "Any rating" },
                { value: "4.5", label: "4.5 & up" },
                { value: "4", label: "4.0 & up" },
              ],
            },
            {
              name: "sort",
              label: "Sort by",
              options: [
                { value: "", label: "Top rated" },
                { value: "reviews", label: "Most reviewed" },
                { value: "rate_asc", label: "Rate: low to high" },
                { value: "rate_desc", label: "Rate: high to low" },
              ],
            },
          ]}
        />
      </PageHeader>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8" aria-labelledby="results-heading">
        <h2 id="results-heading" className="text-sm font-medium text-fg-muted" aria-live="polite">
          {total === 0 ? "No tutors found" : `Showing ${tutors.length} of ${total} tutor${total === 1 ? "" : "s"}`}
        </h2>
        {tutors.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              icon={UserSearch}
              title="No tutors match your search"
              description="Try a broader keyword or remove a filter to see more tutors."
              action={
                <ButtonLink href="/tutors" variant="secondary">
                  Clear filters
                </ButtonLink>
              }
            />
          </div>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tutors.map((tutor) => (
              <TutorCard key={tutor.id} tutor={tutor} />
            ))}
          </div>
        )}
        <Pagination page={page} total={total} pageSize={PAGE_SIZE} basePath="/tutors" params={filters} />
      </section>
    </>
  );
}
