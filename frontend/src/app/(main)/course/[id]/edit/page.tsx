"use client";

import { use } from "react";

import { CourseEditor } from "@/components/course/editor";

interface EditCoursePageProps {
    params: Promise<{ id: string }>;
}

export default function EditCoursePage({ params }: EditCoursePageProps) {
    const { id } = use(params);
    return <CourseEditor courseId={id} />;
}
