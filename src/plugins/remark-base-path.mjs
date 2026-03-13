import { visit } from "unist-util-visit";

/**
 * Remark plugin that prepends the site base path to absolute image src and
 * internal link href attributes so that markdown references like
 * ![alt](/media/...) and [text](/2018/...) resolve correctly on subpath deployments.
 */
export default function remarkBasePath() {
  const base = (process.env.PUBLIC_SITE_BASE || "/").replace(/\/+$/, "");

  if (!base || base === "") {
    return () => {};
  }

  return (tree) => {
    visit(tree, ["image", "link"], (node) => {
      if (node.url && node.url.startsWith("/") && !node.url.startsWith(base + "/")) {
        node.url = `${base}${node.url}`;
      }
    });
  };
}
