import type { Metadata } from "next";
import { Page } from "@/components/dashboard/Page";
import { PageHeading } from "@/components/dashboard/PageHeading";
import { CourseForm } from "@/components/tutor/CourseForm";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = { title: "New course" };

export default function NewCoursePage() {
  return (
    <Page className="max-w-3xl">
      <PageHeading eyebrow="Teaching" title="Create a course" description="It is saved as a draft. Students only see it once you publish." />
      <Card className="p-5 sm:p-8">
        <CourseForm />
      </Card>
    </Page>
  );
}
