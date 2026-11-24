import type { Workspace } from "./types";

export const WORKSPACES: Workspace[] = [
  {
    id: "lumen",
    name: "Lumen Analytics",
    company: "Lumen",
    tagline: "Product analytics for small SaaS teams",
    articles: [
      {
        id: "install-snippet",
        title: "Installing the tracking snippet",
        body: `Add the Lumen snippet to the <head> of every page you want to track. Copy it from Settings > Install, where your project key starts with "lm_pk_". Events appear in Live View within 30 seconds of the first page load. For single-page apps, call lumen.page() on every route change because the snippet only tracks the initial load. The snippet is 4.1 KB gzipped and loads asynchronously, so it never blocks rendering. If you use a content security policy, allow cdn.lumen.example in script-src and ingest.lumen.example in connect-src.`,
      },
      {
        id: "billing-plans",
        title: "Plans and pricing",
        body: `Lumen has three plans. Starter is $29 per month and includes 100,000 tracked events per month and 3 team seats. Growth is $99 per month and includes 1 million events and 10 seats. Business is $399 per month and includes 10 million events, unlimited seats, SSO and a 99.9% uptime SLA. Paying annually saves 20 percent. Extra events are billed at $2 per additional 100,000 events on Starter and Growth. Business customers get volume pricing for anything above 10 million events.`,
      },
      {
        id: "refunds-cancel",
        title: "Refunds and cancellation",
        body: `You can cancel any time from Settings > Billing > Cancel plan. Cancelling stops renewal; your project stays active until the end of the paid period. Monthly plans are not refunded for partial months. Annual plans can be refunded in full within 14 days of purchase or renewal by emailing billing@lumen.example. After 14 days, annual plans are refunded pro rata only if Lumen had an outage that broke the 99.9% SLA, and only for Business customers.`,
      },
      {
        id: "teammates-roles",
        title: "Inviting teammates and roles",
        body: `Go to Settings > Team and click Invite. There are three roles. Owners manage billing and can delete the project. Admins manage settings, integrations and members but cannot see billing. Viewers can read dashboards and create saved views but cannot change settings. Invitations expire after 7 days. Each project has exactly one Owner; to transfer ownership, the current Owner opens the member menu and chooses "Make owner". Seat limits depend on your plan, and pending invitations count toward the limit.`,
      },
      {
        id: "data-retention",
        title: "Data retention and deletion",
        body: `Raw events are kept for 12 months on Starter, 24 months on Growth and 36 months on Business. Aggregated dashboards are kept for as long as your project exists. You can delete a single user's data by sending a DELETE request to /v1/users/{id}, which removes their events within 72 hours and is logged for audit. When a project is deleted, all data is permanently erased after a 30-day grace period during which the Owner can restore it.`,
      },
      {
        id: "sso-saml",
        title: "Single sign-on (SSO) and SAML",
        body: `SSO is available on the Business plan only. Lumen supports SAML 2.0 with Okta, Microsoft Entra ID and Google Workspace. In Settings > Security, choose Enable SSO and paste your identity provider metadata URL. Test with one Admin account before enforcing SSO, because enforcement signs out everyone who has not authenticated through your provider. SCIM user provisioning is not supported yet. Passwords stay valid for the Owner as a break-glass login unless you disable them.`,
      },
      {
        id: "export-api",
        title: "Exporting data and API limits",
        body: `Export any report as CSV from the three-dot menu. Raw event export is available through the Export API at /v1/export, which returns up to 50,000 rows per request in newline-delimited JSON. The API allows 60 requests per minute per project key; exceeding it returns HTTP 429 with a Retry-After header. Warehouse sync to BigQuery and Snowflake is included on Growth and Business plans and runs every hour.`,
      },
    ],
  },
  {
    id: "parcelo",
    name: "Parcelo Shipping",
    company: "Parcelo",
    tagline: "Shipping labels and tracking for online stores",
    articles: [
      {
        id: "rates-services",
        title: "Shipping services and delivery times",
        body: `Parcelo offers three services. Economy delivers in 5 to 8 business days. Standard delivers in 3 to 5 business days. Express delivers in 1 to 2 business days and includes a delivery guarantee. Rates are calculated by weight and zone. Packages over 20 kg or longer than 120 cm on any side are classed as oversize and cost an extra $18 per parcel. Parcelo does not ship on Sundays, and pickups are only available Monday to Saturday.`,
      },
      {
        id: "tracking",
        title: "Tracking a shipment",
        body: `Every label includes a tracking number beginning with "PC". Tracking updates appear within 2 hours of the first carrier scan. If a package shows no movement for 48 hours, open a Trace request from the shipment page; Parcelo contacts the carrier and replies within 1 business day. You can send customers a branded tracking page by turning on Customer Notifications under Settings > Branding. Notifications are sent by email and SMS; SMS is free in the US and Canada.`,
      },
      {
        id: "returns",
        title: "Return labels and the returns portal",
        body: `Create a return label from the shipment page by choosing Create return. Prepaid return labels cost the same as the outbound label for the same weight, and the fee is only charged when the return label is first scanned. Return labels are valid for 90 days. The hosted returns portal lets your customers print their own label; enable it in Settings > Returns and share the link parcelo.example/returns/your-store. Returns to a different address than the origin require adding it under Settings > Addresses first.`,
      },
      {
        id: "insurance-claims",
        title: "Shipping insurance and damage claims",
        body: `Every shipment includes up to $100 of free coverage. You can add insurance up to $5,000 at a cost of $1 per $100 of declared value. To file a claim, go to the shipment page and choose File a claim within 30 days of delivery for damage, or within 15 days of the expected delivery date for lost parcels. You need photos of the damaged item and packaging. Claims are reviewed within 5 business days, and approved claims are paid to your Parcelo balance. Fragile items such as glass are insured only when shipped with the Fragile handling add-on.`,
      },
      {
        id: "customs-international",
        title: "International shipping and customs",
        body: `Parcelo ships to 38 countries. International labels require a customs declaration with item description, quantity, value and HS code. Duties and taxes are billed to the recipient by default; choose Delivered Duty Paid at checkout to collect them from the sender instead, at a $4.50 handling fee per parcel. Prohibited items include lithium batteries shipped alone, aerosols, perfume, and live animals. Customs delays are outside Parcelo's control and are not covered by the Express delivery guarantee.`,
      },
      {
        id: "pickups-labels",
        title: "Scheduling pickups and printing labels",
        body: `Schedule a free carrier pickup under Pickups. Request it before 2 PM local time for same-day pickup if you have 5 or more parcels; otherwise pickup is next business day. Labels print on 4x6 thermal labels or on A4 paper (two per sheet). If a label fails to print, re-download it from the shipment page; labels can be voided within 30 days for a full refund, but not once the carrier has scanned the parcel.`,
      },
      {
        id: "api-webhooks",
        title: "API and webhooks",
        body: `The Parcelo API is REST with JSON over HTTPS, authenticated with a bearer key from Settings > Developers. The default limit is 120 requests per minute. Webhooks notify you of shipment.created, shipment.delivered and shipment.exception events, signed with an HMAC-SHA256 header named X-Parcelo-Signature. Failed webhook deliveries are retried 5 times over 24 hours with exponential backoff. A sandbox environment at sandbox.parcelo.example returns test labels that are never charged.`,
      },
    ],
  },
  {
    id: "fernwood",
    name: "Fernwood People Handbook",
    company: "Fernwood",
    tagline: "Internal HR policies for a 200-person company",
    articles: [
      {
        id: "pto-policy",
        title: "Paid time off",
        body: `Full-time employees receive 24 days of paid time off per calendar year, plus 10 public holidays. Up to 5 unused days carry over into the next year and expire on March 31. Request time off in the HR portal at least 2 weeks ahead for stays longer than 5 consecutive days; shorter requests need 3 working days notice. Managers approve or decline within 2 working days. Unused PTO is paid out when you leave the company, in line with local law.`,
      },
      {
        id: "parental-leave",
        title: "Parental leave",
        body: `All employees with at least 6 months of service get 20 weeks of fully paid parental leave, for birth parents and non-birth parents alike, including adoption. Leave can be taken in one block or split into two blocks within 12 months of the birth or placement. Tell your manager and People Ops at least 8 weeks before the planned start date when possible. Benefits continue unchanged during leave. On return, you are offered a phased schedule of 4 days a week at full pay for the first month.`,
      },
      {
        id: "expenses",
        title: "Expenses and reimbursements",
        body: `Submit expenses in the Fernwood Expenses app within 30 days of purchase with a receipt attached. Meals while travelling are reimbursed up to $60 per day. Flights over $800 and hotels over $220 per night need manager approval before booking. Client entertainment needs approval from a department head. Reimbursements are paid with the next payroll after approval. The company does not reimburse alcohol above $20 per person, fines, or personal travel add-ons.`,
      },
      {
        id: "remote-work",
        title: "Remote and hybrid work",
        body: `Fernwood is remote-friendly. Teams set their own in-office days, with a company-wide minimum of one team gathering per quarter, which is paid for by the company. Working from another country is allowed for up to 30 days per year with manager approval and a heads-up to People Ops for tax reasons; longer stays need a formal review. Each remote employee gets a $600 home-office budget once and a $40 monthly internet stipend.`,
      },
      {
        id: "payroll",
        title: "Payroll and pay dates",
        body: `Payroll runs monthly and salaries are paid on the last working day of each month. Payslips appear in the HR portal two days before payday. Expense reimbursements and overtime are paid in the following month's run. To change bank details, submit the form in the HR portal before the 20th, or the change applies to next month. Salary reviews happen twice a year, in April and October.`,
      },
      {
        id: "equipment-security",
        title: "Equipment and device security",
        body: `New hires receive a laptop and monitor stipend before their first day. All company laptops must have full-disk encryption and automatic screen lock after 5 minutes. Lost or stolen devices must be reported to IT security within 24 hours at security@fernwood.example. Personal devices may access email only through the managed mobile app. Laptops are replaced every 3 years, or earlier if they fail hardware diagnostics.`,
      },
      {
        id: "onboarding",
        title: "Onboarding checklist",
        body: `Before day one, People Ops sends a contract, tax forms and a laptop. Day one starts at 10:00 with an orientation call, followed by IT setup. In week one you meet your buddy, a peer assigned to answer questions, and complete the security training module, which is mandatory. Probation lasts 3 months, with check-ins at 30, 60 and 90 days. Your manager sets 30-60-90 day goals in the first week.`,
      },
    ],
  },
];

export const WORKSPACE_BY_ID = Object.fromEntries(WORKSPACES.map((w) => [w.id, w]));
