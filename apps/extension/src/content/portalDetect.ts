import type { PortalDetectionResult } from '../shared/types';

function hasSelector(doc: Document, selectors: string[]): boolean {
  return selectors.some((selector) => Boolean(doc.querySelector(selector)));
}

export function detectPortal(doc: Document, loc: Location): PortalDetectionResult {
  const hostname = loc.hostname.toLowerCase();

  const workdayReasons: string[] = [];
  if (hostname.includes('myworkdayjobs.com')) workdayReasons.push('Hostname matches myworkdayjobs.com');
  if (hasSelector(doc, ['[data-automation-id]', '[data-uxi-element-id]'])) {
    workdayReasons.push('Workday automation attributes found');
  }
  if (workdayReasons.length > 0) {
    return { portal: 'workday', compatible: true, reasons: workdayReasons, hostname };
  }

  const greenhouseReasons: string[] = [];
  if (hostname.includes('greenhouse.io')) greenhouseReasons.push('Hostname matches greenhouse.io');
  if (hasSelector(doc, ['#application', '#application_form', '.application__content'])) {
    greenhouseReasons.push('Greenhouse application containers found');
  }
  if (greenhouseReasons.length > 0) {
    return { portal: 'greenhouse', compatible: true, reasons: greenhouseReasons, hostname };
  }

  const leverReasons: string[] = [];
  if (hostname.includes('jobs.lever.co')) leverReasons.push('Hostname matches jobs.lever.co');
  if (hasSelector(doc, ['.application-page', '#lever-jobs-container', 'form[data-qa="application-form"]'])) {
    leverReasons.push('Lever application elements found');
  }
  if (leverReasons.length > 0) {
    return { portal: 'lever', compatible: true, reasons: leverReasons, hostname };
  }

  const icimsReasons: string[] = [];
  if (hostname.includes('icims.com')) icimsReasons.push('Hostname matches icims.com');
  if (hasSelector(doc, ['#icims_content', '.iCIMS_JobPage', 'form[name="frm"]'])) {
    icimsReasons.push('iCIMS containers found');
  }
  if (icimsReasons.length > 0) {
    return { portal: 'icims', compatible: true, reasons: icimsReasons, hostname };
  }

  const taleoReasons: string[] = [];
  if (hostname.includes('taleo.net')) taleoReasons.push('Hostname matches taleo.net');
  if (hasSelector(doc, ['#requisitionDescriptionInterface', '#careerSection', 'form[name="oracle"]'])) {
    taleoReasons.push('Taleo structures found');
  }
  if (taleoReasons.length > 0) {
    return { portal: 'taleo', compatible: true, reasons: taleoReasons, hostname };
  }

  return {
    portal: 'unknown',
    compatible: false,
    reasons: ['No supported ATS portal signatures found'],
    hostname,
  };
}
