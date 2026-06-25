"use client";

import { useState, useEffect } from "react";
import { endpointGroups } from "@/lib/endpoint";

function buildEndpointState() {
  const bodies: Record<string, string> = {};
  const urls: Record<string, string> = {};
  const checkoutValues: Record<string, Record<string, string>> = {};
  const urlParamValues: Record<string, Record<string, string>> = {};

  endpointGroups.forEach((group) => {
    group.endpoints.forEach((endpoint) => {
      if (endpoint.defaultBody) {
        if (endpoint.variants?.length) {
          const variantKey = endpoint.variants[0].key;
          bodies[endpoint.id] = JSON.stringify(
            endpoint.defaultBody[variantKey] ?? endpoint.defaultBody,
            null,
            2
          );
        } else {
          bodies[endpoint.id] = JSON.stringify(endpoint.defaultBody, null, 2);
        }
      }
      if (endpoint.url) urls[endpoint.id] = endpoint.url;
      if (endpoint.checkoutFields) {
        checkoutValues[endpoint.id] = endpoint.checkoutFields.reduce<Record<string, string>>((acc, field) => {
          acc[field] = "";
          return acc;
        }, {});
      }
      if (endpoint.params) {
        urlParamValues[endpoint.id] = endpoint.params.reduce<Record<string, string>>((acc, param) => {
          acc[param] = "";
          return acc;
        }, {});
      }
    });
  });

  return { bodies, urls, checkoutValues, urlParamValues };
}

export function useEndpointState() {
  const [bodyValues, setBodyValues] = useState<Record<string, string>>({});
  const [urlValues, setUrlValues] = useState<Record<string, string>>({});
  const [checkoutValues, setCheckoutValues] = useState<Record<string, Record<string, string>>>({});
  const [urlParamValues, setUrlParamValues] = useState<Record<string, Record<string, string>>>({});
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [bodyErrors, setBodyErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const { bodies, urls, checkoutValues, urlParamValues } = buildEndpointState();
    setBodyValues(bodies);
    setUrlValues(urls);
    setCheckoutValues(checkoutValues);
    setUrlParamValues(urlParamValues);
  }, []);

  return {
    bodyValues,
    setBodyValues,
    urlValues,
    setUrlValues,
    checkoutValues,
    setCheckoutValues,
    urlParamValues,
    setUrlParamValues,
    selectedVariants,
    setSelectedVariants,
    bodyErrors,
    setBodyErrors,
  };
}
