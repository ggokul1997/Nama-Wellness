import { Request, Response, NextFunction } from 'express';
import { companiesService } from './companies.service';
import { ApiResponseEnvelope } from '@nama/shared';

export async function handleGetCompanyMe(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const result = await companiesService.getCompanyMe(userId);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleCreateCompany(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await companiesService.createCompany(req.body);
    const response: ApiResponseEnvelope<any> = {
      data: result
    };
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleGetCompanies(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await companiesService.getCompanies();
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleUpdateCompany(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const companyId = req.params.companyId as string;
    const result = await companiesService.updateCompany(companyId, req.body);
    const response: ApiResponseEnvelope<any> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleGetEmployees(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const roles = req.user!.roles;
    const companyId = req.params.companyId as string;
    const result = await companiesService.getEmployees(userId, roles, companyId);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleSendInvite(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const adminUserId = req.user!.userId;
    const companyId = req.params.companyId as string;
    const result = await companiesService.sendInvite(adminUserId, companyId, req.body);
    const response: ApiResponseEnvelope<any> = {
      data: result
    };
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleBulkInvite(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const adminUserId = req.user!.userId;
    const companyId = req.params.companyId as string;
    const result = await companiesService.bulkInvite(adminUserId, companyId, req.body);
    const response: ApiResponseEnvelope<any> = {
      data: result
    };
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleRevokeInvite(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const roles = req.user!.roles;
    const companyId = req.params.companyId as string;
    const inviteId = req.params.inviteId as string;
    await companiesService.revokeInvite(userId, roles, companyId, inviteId);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

export async function handleDeactivateEmployee(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const roles = req.user!.roles;
    const companyId = req.params.companyId as string;
    const employeeId = req.params.employeeId as string;
    const { reason } = req.body;
    const result = await companiesService.deactivateEmployee(userId, roles, companyId, employeeId, reason);
    const response: ApiResponseEnvelope<any> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleGetCorporateParticipation(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const { from, to } = req.query as { from?: string; to?: string };
    const result = await companiesService.getCorporateParticipation(userId, from, to);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleGetCorporateAttendance(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const result = await companiesService.getCorporateAttendance(userId);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleGetCorporateEngagement(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const result = await companiesService.getCorporateEngagement(userId);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleGetEmployeeParticipation(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const result = await companiesService.getEmployeeParticipation(userId);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}
