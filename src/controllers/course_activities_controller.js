import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const createAIReading = async (req, res) => {
  const courseId = parseInt(req.params.idCourse);
  const {
    title,
    description,
    content,
    dueDate,
    length,
    complexity,
    style,
    hasScoring,
    maxScore,
  } = req.body;

  if (!title || !content || !length || !complexity || !style) {
    return res.status(400).json({
      ok: false,
      message: "Title, content, length, complexity, and style are required",
    });
  }

  if (hasScoring && (!maxScore || maxScore <= 0)) {
    return res.status(400).json({
      ok: false,
      message: "maxScore is required when hasScoring is true",
    });
  }

  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return res.status(404).json({
        ok: false,
        message: "Course not found",
      });
    }

    const result = await prisma.$transaction(async (prisma) => {
      const activity = await prisma.activity.create({
        data: {
          courseId: courseId,
          title: title,
          hasScoring: hasScoring || false,
          maxScore: hasScoring ? maxScore : null,
          description: description || null,
          dueDate: dueDate ? new Date(dueDate) : null,
        },
      });

      const aiReading = await prisma.aIReading.create({
        data: {
          activityId: activity.id,
          content: content,
          length: length,
          complexity: complexity,
          style: style,
        },
      });

      return { activity, aiReading };
    });

    const { activity, aiReading } = result;

    const responseBody = {
      id: activity.id,
      title: activity.title,
      description: activity.description,
      dueDate: activity.dueDate,
      hasScoring: activity.hasScoring,
      maxScore: activity.maxScore,
      content: aiReading.content,
      length: aiReading.length,
      complexity: aiReading.complexity,
      style: aiReading.style,
      createdAt: activity.createdAt,
      updatedAt: activity.updatedAt,
    };

    return res.status(201).json({
      ok: true,
      message: "AIReading activity created successfully",
      data: responseBody,
    });
  } catch (error) {
    console.error("Error creating AIReading activity:", error);
    return res.status(500).json({
      ok: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const getAllActivities = async (req, res) => {
  try {
    const courseId = parseInt(req.params.idCourse);

    const activities = await prisma.activity.findMany({
      where: { courseId },
      include: {
        aiReading: true,
      },
    });

    const formatted = activities.map((activity) => {
      let type = null;
      let details = null;

      if (activity.aiReading) {
        type = "AIReading";
        details = {
          content: activity.aiReading.content,
          length: activity.aiReading.length,
          complexity: activity.aiReading.complexity,
          style: activity.aiReading.style,
        };
      }
      // futuro:
      // else if (activity.essay) {
      //   type = "Essay";
      //   details = activity.essay;
      // } else if (activity.quiz) {
      //   type = "Quiz";
      //   details = activity.quiz;
      // }

      return {
        id: activity.id,
        title: activity.title,
        description: activity.description,
        dueDate: activity.dueDate,
        createdAt: activity.createdAt,
        updatedAt: activity.updatedAt,
        type,
        ...details,
      };
    });

    return res.json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    console.error("Error fetching activities:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching activities",
    });
  }
};

export const deleteActivity = async (req, res) => {
  try {
    const activityId = parseInt(req.params.activityId);

    // Verificar que la actividad exista
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }

    // Eliminar la actividad
    await prisma.activity.delete({
      where: { id: activityId },
    });

    return res.json({
      success: true,
      message: "Activity deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting activity:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting activity",
    });
  }
};

export const updateAIReading = async (req, res) => {
  try {
    const activityId = parseInt(req.params.activityId);
    const { content } = req.body;

    const aiReading = await prisma.aIReading.findUnique({
      where: { activityId },
    });

    if (!aiReading) {
      return res.status(404).json({
        success: false,
        message: "AIReading not found for this activity",
      });
    }

    const updatedAIReading = await prisma.aIReading.update({
      where: { activityId },
      data: {
        content,
        updatedAt: new Date(),
      },
    });

    return res.json({
      success: true,
      message: "AIReading updated successfully",
      data: updatedAIReading,
    });
  } catch (error) {
    console.error("Error updating AIReading:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const createParaphraseAttempt = async (req, res) => {
  try {
    const {
      aiReadingId,
      accuracyScore,
      coverageScore,
      clarityScore,
      feedback,
    } = req.body;
    const userId = req.id;

    if (
      !aiReadingId ||
      accuracyScore == null ||
      coverageScore == null ||
      clarityScore == null
    ) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const attempt = await prisma.paraphraseAttempt.create({
      data: {
        aiReadingId,
        userId,
        accuracyScore,
        coverageScore,
        clarityScore,
        feedback,
      },
    });

    return res.status(201).json({
      message: "Paraphrase attempt created successfully.",
      data: attempt,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Failed to create paraphrase attempt." });
  }
};

export const createMainIdeaAttempt = async (req, res) => {
  try {
    const {
      aiReadingId,
      accuracyScore,
      coverageScore,
      clarityScore,
      feedback,
    } = req.body;
    const userId = req.id;

    if (
      !aiReadingId ||
      accuracyScore == null ||
      coverageScore == null ||
      clarityScore == null
    ) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const attempt = await prisma.mainIdeaAttempt.create({
      data: {
        aiReadingId,
        userId,
        accuracyScore,
        coverageScore,
        clarityScore,
        feedback,
      },
    });

    return res.status(201).json({
      message: "Main idea attempt created successfully.",
      data: attempt,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Failed to create main idea attempt." });
  }
};

export const createSummaryAttempt = async (req, res) => {
  try {
    const {
      aiReadingId,
      accuracyScore,
      coverageScore,
      clarityScore,
      feedback,
    } = req.body;
    const userId = req.id;

    if (
      !aiReadingId ||
      accuracyScore == null ||
      coverageScore == null ||
      clarityScore == null
    ) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const attempt = await prisma.summaryAttempt.create({
      data: {
        aiReadingId,
        userId,
        accuracyScore,
        coverageScore,
        clarityScore,
        feedback,
      },
    });

    return res.status(201).json({
      message: "Summary attempt created successfully.",
      data: attempt,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Failed to create summary attempt." });
  }
};

export const createAIReadingAttempt = async (req, res) => {
  try {
    const {
      aiReadingId,
      timeSinceEnterSec,
      timeSinceNextActivitySec,
      playCount,
    } = req.body;
    const userId = req.id;

    if (!aiReadingId) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const event = await prisma.aIReadingAttempt.create({
      data: {
        aiReadingId,
        userId,
        timeSinceEnterSec: timeSinceEnterSec || 0,
        timeSinceNextActivitySec: timeSinceNextActivitySec || 0,
        playCount: playCount || 0,
      },
    });

    return res.status(201).json({
      message: "AI reading audio event created successfully.",
      data: event,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Failed to create AI reading audio event." });
  }
};
