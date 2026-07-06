import { Configuration, FrontendApi } from "@ory/kratos-client";

export const kratos = new FrontendApi(
  new Configuration({
    basePath: typeof window !== "undefined" 
      ? window.location.origin + "/auth" 
      : "http://kratos:4433",
    baseOptions: {
      withCredentials: true,
    },
  })
);
