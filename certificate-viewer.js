const certificates = {
  "ibm-software-engineering": {
    title: "Introduction to Software Engineering",
    image: "certificates/ibm-software-engineering.jpeg",
    alt: "IBM course certificate for Introduction to Software Engineering",
  },
  "michigan-python-basics": {
    title: "Python Basics",
    image: "certificates/michigan-python-basics.jpeg",
    alt: "University of Michigan course certificate for Python Basics",
  },
  "agentic-ai": {
    title: "Understanding Agentic AI",
    image: "certificates/agentic-ai-cert.png",
    alt: "Agent Academy certificate for Understanding Agentic AI",
  },
  "microsoft-it-support": {
    title: "Microsoft IT Support Specialist",
    image: "certificates/microsoft-cert.png",
    alt: "Microsoft IT Support Specialist certificate",
  },
};

const certificateId = new URLSearchParams(window.location.search).get("certificate");
const certificate = certificateId ? certificates[certificateId] : undefined;

if (certificate) {
  document.title = `${certificate.title} | Wilhelm Johansson`;
  document.querySelector("#certificate-title").textContent = certificate.title;

  const image = document.querySelector(".certificate-viewer-image");
  image.src = certificate.image;
  image.alt = certificate.alt;
} else {
  document.querySelector("#certificate-title").textContent = "Certificate not found";
  document.querySelector(".certificate-viewer-image").remove();
}
