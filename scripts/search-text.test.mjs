import assert from "node:assert/strict";
import { test } from "node:test";
import { markdownToText } from "../src/utils/search-text.ts";

test("extracts Markdown, link labels, image descriptions, and code without losing identifiers", async () => {
  assert.equal(
    await markdownToText("# Heading\n\nA **bold** [link](https://example.com) ![diagram](image.png)\n\n```js\nmy_variable = \"some_value\";\n```"),
    'Heading A bold link diagram my_variable = "some_value";'
  );
});

test("removes script and style contents with irregular closing tags", async () => {
  assert.equal(
    await markdownToText('<p>Before</p><script>unwantedScript()</script\t\n bar><style>unwantedStyle</style\t\n bar><p>After</p>'),
    "Before After"
  );
});

test("decodes named and numeric entities only once", async () => {
  for (const [input, expected] of [
    ["&amp;lt;", "&lt;"],
    ["&amp;amp;", "&amp;"],
    ["&#38;amp;", "&amp;"],
    ["&#x26;amp;", "&amp;"],
    ["&#38;#x3c;", "&#x3c;"],
    ["&#38;#x26;", "&#x26;"],
    ["&#128512; &#x1F600;", "\u{1f600} \u{1f600}"],
    ["&unknown;", "&unknown;"],
    ["&#1114112;", "\ufffd"]
  ]) {
    assert.equal(await markdownToText(input), expected, input);
  }
});

test("preserves encoded markup and code examples as literal searchable text", async () => {
  assert.equal(await markdownToText("&lt;img src=x onerror=alert(1)&gt;"), "<img src=x onerror=alert(1)>");
  assert.equal(await markdownToText("`<script>example()</script>`"), "<script>example()</script>");
});

test("preserves inline words and separates block elements", async () => {
  assert.equal(await markdownToText("<p>some<strong>thing</strong></p><p>else</p>"), "something else");
  assert.equal(await markdownToText(undefined), "");
});
