const form = document.querySelector("#check-form");
const input = document.querySelector("#html-input");
const statusText = document.querySelector("#status");
const resultsList = document.querySelector("#results");

function parseHtml(text) {
    return new DOMParser().parseFromString(text, "text/html");
}

function makeResult(passed, title, detail) {
    const item = document.createElement("li");
    item.className = "result-item " + (passed ? "result-pass" : "result-fail");

    const heading = document.createElement("h3");
    heading.textContent = (passed ? "OK: " : "Problem: ") + title;

    const text = document.createElement("p");
    text.textContent = detail;

    item.append(heading, text);
    return item;
}

function checkImages(doc) {
    const images = [...doc.querySelectorAll("img")];
    const missing = images.filter((img) => !img.hasAttribute("alt"));

    if (missing.length === 0) {
        return {
            passed: true,
            title: "Image alt text",
            detail: images.length + " image(s) checked, all have an alt attribute.",
        };
    }
    return {
        passed: false,
        title: "Image alt text",
        detail: missing.length + " of " + images.length + " image(s) have no alt attribute.",
    };
}

function checkHeadings(doc) {
    const headings = [...doc.querySelectorAll("h1, h2, h3, h4, h5, h6")];
    const problems = [];
    let previous = 0;

    for (const heading of headings) {
        const level = Number(heading.tagName[1]);
        if (previous !== 0 && level > previous + 1) {
            problems.push("h" + previous + " is followed by h" + level);
        }
        previous = level;
    }

    const h1Count = headings.filter((h) => h.tagName === "H1").length;
    if (headings.length > 0 && h1Count !== 1) {
        problems.push("expected exactly one h1, found " + h1Count);
    }

    if (problems.length === 0) {
        return {
            passed: true,
            title: "Heading order",
            detail: headings.length + " heading(s) checked, no problems found.",
        };
    }
    return { passed: false, title: "Heading order", detail: problems.join("; ") + "." };
}

function checkLabels(doc) {
    const skipped = ["hidden", "submit", "button", "reset", "image"];
    const fields = [...doc.querySelectorAll("input, select, textarea")].filter((field) => !skipped.includes(field.type),
    );

    const unlabelled = fields.filter((field) => {
        const hasWrapper = field.closest("label") !== null;
        const hasFor = 
            field.id !== "" &&
            doc.querySelector('label[for="' + CSS.escape(field.id) + '"]') !== null;
        const hasAria = field.hasAttribute("aria-label") || field.hasAttribute("aria-labelledby");
        return !(hasWrapper || hasFor || hasAria);   
    });

    if (unlabelled.length === 0) {
        return {
            passed: true,
            title: "Form labels",
            detail: fields.length + " field(s) checked, all have a label.",
        };
    }
    return {
        passed: false,
        title: "Form labels",
        detail: unlabelled.length + " of " + fields.length + " field(s) have no label.",
    };
}

form.addEventListener("submit", (event) => {
    event.preventDefault();

    const doc = parseHtml(input.value);
    const results = [checkImages(doc), checkHeadings(doc), checkLabels(doc)];

    resultsList.replaceChildren(
        ...results.map((r) => makeResult(r.passed, r.title, r.detail)),
    );

    const problems = results.filter((r) => !r.passed).length;
    statusText.textContent =
        problems === 0
            ? "All " + results.length + " checks passed"
            : problems + " of " + results.length + " checks found problems";
});