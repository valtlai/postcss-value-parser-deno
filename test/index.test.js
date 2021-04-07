import { assertEquals, assertStrictEquals } from "./deps.js";
import parser from "../mod.js";

Deno.test("ValueParser: i/o", function() {
  var tests = [
    " rgba( 34 , 45 , 54, .5 ) ",
    "w1 w2 w6 \n f(4) ( ) () \t \"s't\" 'st\\\"2'"
  ];

  tests.forEach(function(item) {
    assertStrictEquals(
      item,
      parser(item)
        .walk(function() {})
        .toString(),
      JSON.stringify(item)
    );
  });
});

Deno.test("ValueParser: walk", function() {
  var result;

  result = [];

  parser("fn( ) fn2( fn3())").walk(function(node) {
    if (node.type === "function") {
      result.push(node);
    }
  });

  assertEquals(
    result,
    [
      {
        type: "function",
        sourceIndex: 0,
        value: "fn",
        before: " ",
        after: "",
        nodes: []
      },
      {
        type: "function",
        sourceIndex: 6,
        value: "fn2",
        before: " ",
        after: "",
        nodes: [
          {
            type: "function",
            sourceIndex: 11,
            value: "fn3",
            before: "",
            after: "",
            nodes: []
          }
        ]
      },
      {
        type: "function",
        sourceIndex: 11,
        value: "fn3",
        before: "",
        after: "",
        nodes: []
      }
    ],
    "should process all functions"
  );

  result = [];

  parser("fn( ) fn2( fn3())").walk(function(node) {
    if (node.type === "function") {
      result.push(node);
      if (node.value === "fn2") {
        return false;
      }
    }
    return true;
  });

  assertEquals(
    result,
    [
      {
        type: "function",
        sourceIndex: 0,
        value: "fn",
        before: " ",
        after: "",
        nodes: []
      },
      {
        type: "function",
        sourceIndex: 6,
        value: "fn2",
        before: " ",
        after: "",
        nodes: [
          {
            type: "function",
            sourceIndex: 11,
            value: "fn3",
            before: "",
            after: "",
            nodes: []
          }
        ]
      }
    ],
    "shouldn't process functions after falsy callback"
  );

  result = [];

  parser("fn( ) fn2( fn3())").walk(function(node) {
    if (node.type === "function" && node.value === "fn2") {
      node.type = "word";
    }
    result.push(node);
  });

  assertEquals(
    result,
    [
      {
        type: "function",
        sourceIndex: 0,
        value: "fn",
        before: " ",
        after: "",
        nodes: []
      },
      { type: "space", sourceIndex: 5, value: " " },
      {
        type: "word",
        sourceIndex: 6,
        value: "fn2",
        before: " ",
        after: "",
        nodes: [
          {
            type: "function",
            sourceIndex: 11,
            value: "fn3",
            before: "",
            after: "",
            nodes: []
          }
        ]
      }
    ],
    "shouldn't process nodes with defined non-function type"
  );

  result = [];

  parser("fn2( fn3())").walk(function(node) {
    if (node.type === "function") {
      result.push(node);
    }
  }, true);

  assertEquals(
    result,
    [
      {
        type: "function",
        sourceIndex: 5,
        value: "fn3",
        before: "",
        after: "",
        nodes: []
      },
      {
        type: "function",
        sourceIndex: 0,
        value: "fn2",
        before: " ",
        after: "",
        nodes: [
          {
            type: "function",
            sourceIndex: 5,
            value: "fn3",
            before: "",
            after: "",
            nodes: []
          }
        ]
      }
    ],
    "should process all functions with reverse mode"
  );
});
