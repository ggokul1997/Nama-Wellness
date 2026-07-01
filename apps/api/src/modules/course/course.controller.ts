import { Request, Response, NextFunction } from 'express';
import { courseService } from './course.service';
import { ApiResponseEnvelope } from '@nama/shared';

export async function handleGetCourses(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userContext = req.user ? { userId: req.user.userId, roles: req.user.roles } : undefined;
    const { categoryId, courseType, search, status, teacherId, page, limit } = req.query;

    const result = await courseService.getCourses(userContext, {
      categoryId: categoryId as string,
      courseType: courseType as any,
      search: search as string,
      status: status as any,
      teacherId: teacherId as string,
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined
    });

    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleGetCourseById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userContext = req.user ? { userId: req.user.userId, roles: req.user.roles } : undefined;
    const courseId = req.params.courseId as string;
    const result = await courseService.getCourseById(userContext, courseId);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleCreateCourse(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const roles = req.user!.roles;
    const result = await courseService.createCourse(userId, roles, req.body);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleUpdateCourse(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const roles = req.user!.roles;
    const courseId = req.params.courseId as string;
    const result = await courseService.updateCourse(userId, roles, courseId, req.body);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

// Module handlers
export async function handleGetModules(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userContext = req.user ? { userId: req.user.userId, roles: req.user.roles } : undefined;
    const courseId = req.params.courseId as string;
    const result = await courseService.getModules(userContext, courseId);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleCreateModule(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const roles = req.user!.roles;
    const courseId = req.params.courseId as string;
    const result = await courseService.createModule(userId, roles, courseId, req.body);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleUpdateModule(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const roles = req.user!.roles;
    const courseId = req.params.courseId as string;
    const moduleId = req.params.moduleId as string;
    const result = await courseService.updateModule(userId, roles, courseId, moduleId, req.body);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleDeleteModule(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const roles = req.user!.roles;
    const courseId = req.params.courseId as string;
    const moduleId = req.params.moduleId as string;
    await courseService.deleteModule(userId, roles, courseId, moduleId);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

// Lesson handlers
export async function handleCreateLesson(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const roles = req.user!.roles;
    const courseId = req.params.courseId as string;
    const moduleId = req.params.moduleId as string;
    const result = await courseService.createLesson(userId, roles, courseId, moduleId, req.body);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleUpdateLesson(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const roles = req.user!.roles;
    const courseId = req.params.courseId as string;
    const moduleId = req.params.moduleId as string;
    const lessonId = req.params.lessonId as string;
    const result = await courseService.updateLesson(userId, roles, courseId, moduleId, lessonId, req.body);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleDeleteLesson(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const roles = req.user!.roles;
    const courseId = req.params.courseId as string;
    const moduleId = req.params.moduleId as string;
    const lessonId = req.params.lessonId as string;
    await courseService.deleteLesson(userId, roles, courseId, moduleId, lessonId);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

// Pricing handlers
export async function handleProposePricing(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const roles = req.user!.roles;
    const courseId = req.params.courseId as string;
    const result = await courseService.proposePricing(userId, roles, courseId, req.body);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleApprovePricing(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const roles = req.user!.roles;
    const courseId = req.params.courseId as string;
    const pricingId = req.params.pricingId as string;
    const result = await courseService.approvePricing(userId, roles, courseId, pricingId, req.body);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

// Review & Publish state machine handlers
export async function handleSubmitCourse(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const roles = req.user!.roles;
    const courseId = req.params.courseId as string;
    const result = await courseService.submitCourse(userId, roles, courseId);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleApproveCourse(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const roles = req.user!.roles;
    const courseId = req.params.courseId as string;
    const result = await courseService.approveCourse(roles, courseId, req.body);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleRejectCourse(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const roles = req.user!.roles;
    const courseId = req.params.courseId as string;
    const result = await courseService.rejectCourse(roles, courseId, req.body);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleRequestChanges(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const roles = req.user!.roles;
    const courseId = req.params.courseId as string;
    const result = await courseService.requestChanges(roles, courseId, req.body);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handlePublishCourse(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const roles = req.user!.roles;
    const courseId = req.params.courseId as string;
    const result = await courseService.publishCourse(roles, courseId);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleAssignTeacher(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const roles = req.user!.roles;
    const courseId = req.params.courseId as string;
    const result = await courseService.assignTeacher(roles, courseId, req.body);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}
