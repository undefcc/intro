"use client";

import React from "react";
import { Snippet as TSnippet } from ".contentlayer/generated";
import { useMDXComponent } from "next-contentlayer/hooks";
import Pre from "./pre";

const components = {
  pre: Pre,
};

export function Snippet({ snippet }: { snippet: TSnippet }) {
  const MDXContent = useMDXComponent(snippet.body.code);
  return <MDXContent components={components} />;
}
