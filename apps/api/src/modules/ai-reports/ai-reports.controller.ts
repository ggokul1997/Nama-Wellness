import { Request, Response, NextFunction } from 'express';
import { aiReportsService } from './ai-reports.service';
import { ApiResponseEnvelope } from '@nama/shared';

export async function handleGetCompanyReports(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const companyId = req.params.companyId as string;
    const reports = await aiReportsService.getCompanyReports(companyId);
    const response: ApiResponseEnvelope<typeof reports> = {
      data: reports
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleGenerateReport(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const companyId = req.params.companyId as string;
    const { reportType, periodStart, periodEnd } = req.body;
    
    const result = await aiReportsService.queueReportGeneration(companyId, {
      reportType,
      periodStart: new Date(periodStart),
      periodEnd: new Date(periodEnd)
    });

    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(202).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleGetReportById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const reportId = req.params.reportId as string;
    const report = await aiReportsService.getReportById(reportId);
    const response: ApiResponseEnvelope<typeof report> = {
      data: report
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}
