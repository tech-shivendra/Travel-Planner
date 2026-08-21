function calculateCost(days, people, type, budget){
  let base = 2000;

  if(type === "adventure") base += 800;
  if(type === "honeymoon") base += 1200;
  if(type === "family") base += 600;

  if(budget === "standard") base *= 1.4;
  if(budget === "luxury") base *= 2.2;

  return Math.round(base * days * people);
}

function generatePlan(){
  const dest = destination.value.trim();
  const start = new Date(startDate.value);
  const end = new Date(endDate.value);
  const type = document.getElementById("type").value;
  const people = +document.getElementById("people").value;
  const budget = document.getElementById("budget").value;

  if(!dest || !start || !end){
    alert("Please fill all fields");
    return;
  }

  const days = Math.max(1, (end - start) / (1000*60*60*24));
  const cost = calculateCost(days, people, type, budget);

  document.getElementById("result").innerHTML = `
    <div class="plan-card">
      <h3>${type.toUpperCase()} Trip to ${dest}</h3>
      <p><strong>Duration:</strong> ${days} days • ${people} people</p>

      <div class="cost-box">
        <h4>Estimated Cost</h4>
        <p>₹ ${cost.toLocaleString()}</p>
      </div>

      <div class="plan-grid">
        <div class="report">
          <h4>Suggested Itinerary</h4>
          <ul>
            <li>Day 1: Arrival & rest</li>
            <li>Day 2–${days-1}: Exploration & activities</li>
            <li>Day ${days}: Departure</li>
          </ul>
        </div>

        <a href="../map/map.html" class="planner-btn weatherc"> See weather Condition</a>

        <div class="map-box">
          <iframe
            src="https://www.openstreetmap.org/export/embed.html?search=${encodeURIComponent(dest)}"
            loading="lazy">
          </iframe>
        </div>

      </div>
    </div>
  `;

  const section = document.getElementById("result");
  section.style.display="block";
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth', // Smooth animation
            block: 'start'      // Aligns the top of the element to the top of the viewport
        });
    }


}