import { queryOptions } from "@tanstack/react-query";
import {
  getListing,
  getSiteSettings,
  listEvents,
  listFaqs,
  listListings,
  listServices,
} from "./content.functions";

export const eventsQuery = queryOptions({
  queryKey: ["events"],
  queryFn: () => listEvents(),
  staleTime: 60_000,
});

export const servicesQuery = queryOptions({
  queryKey: ["services"],
  queryFn: () => listServices(),
  staleTime: 60_000,
});

export const faqsQuery = queryOptions({
  queryKey: ["faqs"],
  queryFn: () => listFaqs(),
  staleTime: 60_000,
});

export const listingsQuery = queryOptions({
  queryKey: ["listings"],
  queryFn: () => listListings(),
  staleTime: 60_000,
});

export const listingQuery = (id: string) =>
  queryOptions({
    queryKey: ["listing", id],
    queryFn: () => getListing({ data: id }),
    staleTime: 60_000,
  });

export const siteSettingsQuery = queryOptions({
  queryKey: ["site-settings"],
  queryFn: () => getSiteSettings(),
  staleTime: 60_000,
});
