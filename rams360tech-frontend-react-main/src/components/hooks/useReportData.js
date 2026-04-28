// hooks/useReportData.js
// Shared hook used by ALL report child components.
// Handles: project details + a single module-specific report API call.
// Child components NO LONGER need to fetch project-permission separately —
// the parent (Reports.js) already guards access before rendering them.

import { useState, useEffect, useCallback, useRef } from "react";
import Api from "../../Api";
import { useHistory } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * @param {object} options
 * @param {string}   options.projectId
 * @param {string}   options.reportEndpoint   - e.g. "/api/v1/reports/get/pbs/report"
 * @param {object}   [options.extraParams]    - extra query params beyond projectId/userId/reportType/hierarchyType
 * @param {string}   [options.reportType]
 * @param {string}   [options.hierarchyType]
 * @param {boolean}  [options.skip]           - set true when reportType == 5 (ComponentType handles its own fetch)
 */
export function useReportData({
  projectId,
  reportEndpoint,
  extraParams = {},
  reportType,
  hierarchyType,
  skip = false,
}) {
  const { user } = useAuth();
  const history = useHistory();
  const [projectData, setProjectData] = useState(null);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Keep a ref so we can cancel stale requests on cleanup
  const cancelledRef = useRef(false);

  const logout = useCallback(() => {
    localStorage.clear();
    history.push("/login");
    window.location.reload();
  }, [history]);

  const fetchAll = useCallback(async () => {
    if (!projectId || !user?._id || skip) {
      setIsLoading(false);
      return;
    }

    cancelledRef.current = false;
    setIsLoading(true);
    setError(null);

    try {
      // Always fetch project details; conditionally fetch report data
      const requests = [
        Api.get(`/api/v1/projectCreation/${projectId}`),
        Api.get(reportEndpoint, {
          params: {
            projectId,
            userId: user._id,
            reportType,
            hierarchyType,
            ...extraParams,
          },
        }),
      ];

      const [projectRes, reportRes] = await Promise.all(requests);

      if (cancelledRef.current) return;

      setProjectData(projectRes?.data?.data ?? null);
      setData(reportRes?.data?.data ?? []);
    } catch (err) {
      if (cancelledRef.current) return;
      if (err?.response?.status === 401) {
        logout();
      } else {
        console.error(`Report fetch error [${reportEndpoint}]:`, err);
        setError(err);
      }
    } finally {
      if (!cancelledRef.current) setIsLoading(false);
    }
  }, [projectId, user?._id, reportEndpoint, reportType, hierarchyType, skip, logout]); // eslint-disable-line

  useEffect(() => {
    fetchAll();
    return () => {
      cancelledRef.current = true;
    };
  }, [fetchAll]);

  return { projectData, data, isLoading, error, refetch: fetchAll };
}

/**
 * Lightweight variant for components that need TWO report endpoints
 * (e.g. FMECAreport which also calls fmeca/details and pmmra/details).
 */
export function useMultiReportData({
  projectId,
  reportEndpoint,
  secondaryEndpoints = [], // [{ key: "fmecaData", url: "..." }, ...]
  reportType,
  hierarchyType,
  skip = false,
}) {
  const { user } = useAuth();
  const history = useHistory();
  const [projectData, setProjectData] = useState(null);
  const [data, setData] = useState([]);
  const [secondaryData, setSecondaryData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const cancelledRef = useRef(false);

  const logout = useCallback(() => {
    localStorage.clear();
    history.push("/login");
    window.location.reload();
  }, [history]);

  const fetchAll = useCallback(async () => {
    if (!projectId || !user?._id || skip) {
      setIsLoading(false);
      return;
    }

    cancelledRef.current = false;
    setIsLoading(true);
    setError(null);

    try {
      const baseParams = { projectId, userId: user._id, reportType, hierarchyType };

      const requests = [
        Api.get(`/api/v1/projectCreation/${projectId}`),
        Api.get(reportEndpoint, { params: baseParams }),
        ...secondaryEndpoints.map(({ url, params = {} }) =>
          Api.get(url, { params: { projectId, userId: user._id, ...params } })
        ),
      ];

      const [projectRes, reportRes, ...secondaryResults] = await Promise.all(requests);

      if (cancelledRef.current) return;

      setProjectData(projectRes?.data?.data ?? null);
      setData(reportRes?.data?.data ?? []);

      const secondary = {};
      secondaryEndpoints.forEach(({ key }, i) => {
        secondary[key] = secondaryResults[i]?.data?.data ?? [];
      });
      setSecondaryData(secondary);
    } catch (err) {
      if (cancelledRef.current) return;
      if (err?.response?.status === 401) {
        logout();
      } else {
        console.error(`Multi-report fetch error:`, err);
        setError(err);
      }
    } finally {
      if (!cancelledRef.current) setIsLoading(false);
    }
  }, [projectId, user?._id, reportEndpoint, reportType, hierarchyType, skip, logout]); // eslint-disable-line

  useEffect(() => {
    fetchAll();
    return () => {
      cancelledRef.current = true;
    };
  }, [fetchAll]);

  return { projectData, data, secondaryData, isLoading, error, refetch: fetchAll };
}