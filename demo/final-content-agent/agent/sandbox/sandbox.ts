import { defaultBackend, defineSandbox } from "eve/sandbox";

const researchNetworkPolicy = {
  allow: [
    "spring.io",
    "*.spring.io",
    "docs.spring.io",
    "openjdk.org",
    "github.com",
    "api.github.com",
    "modelcontextprotocol.io",
  ],
  subnets: {
    deny: ["10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16"],
  },
};

export default defineSandbox({
  description:
    "Isolated workspace for SpringForAll content research, article drafts, source notes, and review artifacts.",
  backend: defaultBackend({
    vercel: { networkPolicy: researchNetworkPolicy },
    microsandbox: { networkPolicy: researchNetworkPolicy },
    docker: { networkPolicy: "allow-all" },
  }),
});
