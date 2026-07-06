import { useState, useEffect } from "react";
import { kratos } from "@/kratos";

export type FlowType = "login" | "registration" | "settings" | "recovery" | "verification";

interface UseKratosFlowOptions {
  flowType: FlowType;
  flowId?: string;
  returnTo?: string;
}

export function useKratosFlow<TFlow>({ flowType, flowId, returnTo }: UseKratosFlowOptions) {
  const [flow, setFlow] = useState<TFlow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initUrl = `/auth/self-service/${flowType}/browser`;

  useEffect(() => {
    if (!flowId) {
      let url = initUrl;
      if (returnTo) {
        url += `?return_to=${encodeURIComponent(returnTo)}`;
      }
      window.location.href = url;
      return;
    }

    const fetchPromise = (() => {
      switch (flowType) {
        case "login": return kratos.getLoginFlow({ id: flowId });
        case "registration": return kratos.getRegistrationFlow({ id: flowId });
        case "settings": return kratos.getSettingsFlow({ id: flowId });
        case "recovery": return kratos.getRecoveryFlow({ id: flowId });
        case "verification": return kratos.getVerificationFlow({ id: flowId });
        default: throw new Error("Unknown flow type");
      }
    })();

    fetchPromise
      .then(({ data }) => {
        setFlow(data as any);
        setLoading(false);
      })
      .catch((err: any) => {
        if (err.response?.status === 410 || err.response?.status === 404) {
          let restartUrl = initUrl;
          if (returnTo) {
            restartUrl += `?return_to=${encodeURIComponent(returnTo)}`;
          }
          window.location.href = restartUrl;
        } else if (err.response?.status === 401) {
          let loginUrl = "/auth/self-service/login/browser";
          if (returnTo) {
             loginUrl += `?return_to=${encodeURIComponent(returnTo)}`;
          } else if (flowType === "settings") {
             // For settings, if we redirect to login, we usually want to return back to settings
             loginUrl += `?return_to=${encodeURIComponent("/settings")}`;
          }
          window.location.href = loginUrl;
        } else {
          setError(err.message || "Failed to fetch flow");
          setLoading(false);
        }
      });
  }, [flowId, flowType, initUrl, returnTo]);

  const submitFlow = async (body: any) => {
    try {
      const updatePromise = (() => {
        switch (flowType) {
          case "login": return kratos.updateLoginFlow({ flow: flowId!, updateLoginFlowBody: body });
          case "registration": return kratos.updateRegistrationFlow({ flow: flowId!, updateRegistrationFlowBody: body });
          case "settings": return kratos.updateSettingsFlow({ flow: flowId!, updateSettingsFlowBody: body });
          case "recovery": return kratos.updateRecoveryFlow({ flow: flowId!, updateRecoveryFlowBody: body });
          case "verification": return kratos.updateVerificationFlow({ flow: flowId!, updateVerificationFlowBody: body });
          default: throw new Error("Unknown flow type");
        }
      })();

      const { data } = await updatePromise;
      const responseData = data as any;

      if (responseData.redirect_browser_to) {
        window.location.href = responseData.redirect_browser_to;
        return { success: true, data: responseData };
      }

      if (flowType === "settings") {
        setFlow(responseData);
        alert("Настройки успешно сохранены!");
        return { success: true, data: responseData };
      }

      window.location.href = returnTo || "/";
      return { success: true, data: responseData };
    } catch (err: any) {
      if (err.response?.status === 400) {
        setFlow(err.response.data as TFlow);
        return { success: false, error: err };
      } else {
        setError(err.message || "An unexpected error occurred");
        throw err;
      }
    }
  };

  return { flow, loading, error, submitFlow };
}
