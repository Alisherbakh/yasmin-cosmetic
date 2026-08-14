console.log("Home frontend javascript file");

const field = document.querySelector(".home-animation");

if (field) {
  const sparkCount = 70;
  for (let i = 0; i < sparkCount; i++) {
    const spark = document.createElement("div");
    spark.className = "spark";
    const size = 1 + Math.random() * 2.4;
    spark.style.width = size + "px";
    spark.style.height = size + "px";
    spark.style.left = Math.random() * 100 + "%";
    spark.style.top = Math.random() * 70 + "%";
    spark.style.animationDuration = 2 + Math.random() * 3 + "s";
    spark.style.animationDelay = Math.random() * -5 + "s";
    field.appendChild(spark);
  }

  const colors = ["#c6a15b", "#d88aa0", "#e8d3a3"];
  const driftCount = 20;
  for (let i = 0; i < driftCount; i++) {
    const petal = document.createElement("div");
    petal.className = "drift";
    const size = 4 + Math.random() * 8;
    petal.style.width = size + "px";
    petal.style.height = size + "px";
    petal.style.left = Math.random() * 100 + "%";
    petal.style.background = colors[Math.floor(Math.random() * colors.length)];
    petal.style.setProperty("--x-drift", Math.random() * 140 - 70 + "px");
    petal.style.animationDuration = 11 + Math.random() * 9 + "s";
    petal.style.animationDelay = Math.random() * -18 + "s";
    field.appendChild(petal);
  }
}
