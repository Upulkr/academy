import { db } from "@/lib/db";
import { Course, Section } from "@prisma/client";
import { Progress } from "@radix-ui/react-progress";
import Link from "next/link";
import React from "react";

interface CourseSideBarProps {
  course: Course & { section: Section[] };
  studentId: string;
}
const CourseSideBar = async ({ course, studentId }: CourseSideBarProps) => {
  const publishedSections = await db.section.findMany({
    where: {
      courseId: course.id,
      isPublished: true,
    },
    orderBy: {
      position: "asc",
    },
  });

  // returning ids array [1,2,3 etc]
  const publishedSectionsIds = publishedSections.map((section) => section.id);

  const purchase = await db.purchase.findUnique({
    where: {
      customerId_courseId: {
        customerId: studentId,
        courseId: course.id,
      },
    },
  });

  const completedSections = await db.progress.count({
    where: {
      studentId,
      sectionId: {
        in: publishedSectionsIds,
      },
      isCompleted: true,
    },
  });

  const progressPercentage =
    (completedSections / publishedSectionsIds.length) * 100;
  return (
    <div className="hidden md:flex flex-col w-64 border-r shadow-md px-3 my-4 text-sm font-medium">
      <h1 className="text-lg font-bold text-center mb-4">{course.title}</h1>{" "}
      {purchase && (
        <div>
          <Progress value={progressPercentage} className="h-2 bg-[#FDAB04]" />
          <p className="text-xs">{Math.round(progressPercentage)}% completed</p>
        </div>
      )}
      <Link
        href={`/courses/${course.id}/overview`}
        className={`p-3 rounded-lg hover:bg-[#FFF8EB] mt-4`}
      >
        Overview
      </Link>
      {publishedSections.map((section) => (
        <Link
          key={section.id}
          href={`/courses/${course.id}/sections/${section.id}`}
          className="p-3 rounded-lg hover:bg-[#FFF8EB] mt-4"
        >
          {section.title}
        </Link>
      ))}
    </div>
  );
};

export default CourseSideBar;