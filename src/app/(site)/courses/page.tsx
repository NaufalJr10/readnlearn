import { SearchX } from "lucide-react";
import type { Metadata } from "next";
import { CourseCard } from "@/components/catalog/CourseCard";
import { FilterBar } from "@/components/catalog/FilterBar";
import { Pagination } from "@/components/catalog/Pagination";
import { PageHeader } from "@/components/site/PageHeader";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { EmptyState } from "@/components/ui/EmptyState";
import { listSubjects, PAGE_SIZE, searchCourses, type CourseFilters } from "@/lib/catalog";

export const metadata: Metadata = { title: "Browse courses", description: "Search courses by subject, price, rating and tutor." };

function pick(params: Record<string, string | string[] | undefined>): CourseFilters {
  const get = (key: string) => (typeof params[key] === "string" ? (params[key] as string) : undefined);
  return { q: get("q"), subject: get("subject"), price: get("price"), minRating: get("minRating"), sort: get("sort"), page: get("page") };
}

export default async function CoursesPage({ searchParams }: PageProps<"/courses">) {
  const filters = pick(await searchParams);
  const [{ courses, total, page }, subjects] = await Promise.all([searchCourses(filters), listSubjects()]);

  return (
    <>
      <PageHeader eyebrow="Course catalog" title="Find your next course" description="Search by topic, tutor or skill, then narrow down by price and rating.">
        <FilterBar
          searchLabel="Search courses"
          searchPlaceholder="Try “calculus”, “python” or a tutor’s name"
          filters={[
            { name: "subject", label: "Subject", options: [{ value: "", label: "All subjects" }, ...subjects.map((s) => ({ value: s, label: s }))] },
            {
              name: "price",
              label: "Price",
              options: [
                { value: "", label: "Any price" },
                { value: "free", label: "Free" },
                { value: "paid", label: "Paid" },
              ],
            },
            {
              name: "minRating",
              label: "Rating",
              options: [
                { value: "", label: "Any rating" },
                { value: "4.5", label: "4.5 & up" },
                { value: "4", label: "4.0 & up" },
                { value: "3", label: "3.0 & up" },
              ],
            },
            {
              name: "sort",
              label: "Sort by",
              options: [
                { value: "", label: "Best match" },
                { value: "rating", label: "Highest rated" },
                { value: "newest", label: "Newest" },
                { value: "price_asc", label: "Price: low to high" },
                { value: "price_desc", label: "Price: high to low" },
              ],
            },
          ]}
        />
      </PageHeader>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8" aria-labelledby="results-heading">
        <h2 id="results-heading" className="text-sm font-medium text-fg-muted" aria-live="polite">
          {total === 0 ? "No courses found" : `Showing ${courses.length} of ${total} course${total === 1 ? "" : "s"}`}
        </h2>
        {courses.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              icon={SearchX}
              title="No courses match your search"
              description="Try a different keyword or clear some filters. New courses are added all the time."
              action={
                <ButtonLink href="/courses" variant="secondary">
                  Clear filters
                </ButtonLink>
              }
            />
          </div>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
        <Pagination page={page} total={total} pageSize={PAGE_SIZE} basePath="/courses" params={filters} />
      </section>
    </>
  );
}
