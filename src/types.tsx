export type IGridStyle = AGridSupportThemes | "xhtml";

export interface IList {
  keys: string[];
  array?: string[] | Record<string, string>[];
}

export type AGridSupportThemes =
  | "aggrid-default"
  | "ag-theme-alpine"
  | "ag-theme-material";

interface DimensionValue {
  value: string;
}

interface MetricValue {
  value: string;
}

interface DimensionHeader {
  name: string;
}

interface MetricHeader {
  name: string;
  type: string;
}
export interface AnalyticsApiResponse {
  dimensionHeaders: DimensionHeader[];
  metricHeaders: MetricHeader[];
  rows: {
    dimensionValues: DimensionValue[];
    metricValues: MetricValue[];
  }[];
  rowCount: number;
  metadata: {
    currencyCode: string;
    timeZone: string;
  };
  kind: string;
}
export interface AnalyticsRequestType {
  startDate: Date;
  endDate: Date;
  token: string;
  metrics: string;
  dimensions: ChartDimension[];
}
export interface MobileUsabilityApiResponse {
  testStatus: {
    status: string;
  };
  mobileFriendliness: string;
}
export interface PageSpeedApiResponse {
  lighthouseResult: {
    categories: {
      performance: {
        score: number;
      };
    };
    audits: {
      metrics: {
        score: number;
        title: string;
        description: string;
        details: {
          items: {
            firstContentfulPaint: number;
            largestContentfulPaint: number;
            totalBlockingTime: number;
            cumulativeLayoutShift: number;
            speedIndex: number;
          }[];
        };
      };
      metrics2: {
        score: number;
        title: string;
        description: string;
      };
    };
  };
}
export interface MobileFriendlinesProps {
  apiKey?: string;
  url: string;
}

export interface SiteMapEvidenceProps {
  token: string;
  url: string;
  sitemapUrl: string;
}
export interface SiteMapErrorProps {
  error: {
    code: number;
    message: string;
  };
}
interface ChartDimension {
  name: string;
}
export interface ChartProps {
  metric: string;
  dimension: ChartDimension[];
  token: string;
  title: string;
}

export interface UsersResponseType {
  result: {
    id: string;
    userName: string;
    human: {
      profile: {
        firstName: string;
        lastName: string;
      };
      email: {
        email: string;
      };
    };
  };
}
export interface UsersResultType {
  id: string;
  userName?: string;
  human?: {
    profile?: {
      firstName?: string;
      lastName?: string;
    };
    email?: {
      email?: string;
    };
  };
}

export interface UserSearchResultType {
  result: {
    id: string;
    userName: string;
    state: string;
    human: {
      profile: {
        firstName: string;
        lastName: string;
      };
      email: {
        email: string;
        isEmailVerified?: boolean;
      };
    };
  }[];
}

export interface UsersDataType {
  id: string;
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
}
export type EnvDataType = Record<string, string | boolean | undefined>;

export interface UserResponceDataType {
  id: string;
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface ProcessedUserType {
  id: string;
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface UserObjectType {
  id: string;
  state: string;
  userName: string;
  human?: {
    profile: {
      firstName: string;
      lastName: string;
    };
    email?: {
      email: string;
    };
  };
}

interface ProjectDetailsType {
  totalResult: string;
  viewTimestamp: string;
}

interface ProjectResultProjectDetailsType {
  sequence: string;
  creationDate: string;
  changeDate: string;
  resourceOwner: string;
}

interface ProjectResultItemType {
  id: string;
  details: ProjectResultProjectDetailsType;
  name: string;
  state: string;
  projectRoleAssertion: boolean;
}

export interface ProjectListResponseType {
  details: ProjectDetailsType;
  result: ProjectResultItemType[];
}

export interface AuditType {
  name: string;
  date: Date;
  description: string;
  activity: string;
  activityType: string;
}

export interface SessionType {
  auditType: string;
  name: string;
  tenantName: string;
  contactPerson: string;
  dueDate: string;
  controlTypes: ControlType[];
}
export interface Controls {
  status: string;
  controlCode: string;
  question: string;
  reviewNote: string;
  policies: number;
  evidence: number;
}
export interface ControlType {
  name: string;
  controls: Controls[];
}
