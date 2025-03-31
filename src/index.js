document.addEventListener("DOMContentLoaded", () => {
    const quoteList = document.getElementById("quote-list");
    const quoteForm = document.getElementById("new-quote-form");

    const API_URL = "http://localhost:3000/quotes";

    // Fetch and display quotes
    function fetchQuotes() {
        fetch(`${API_URL}?_embed=likes`)
            .then(res => res.json())
            .then(data => renderQuotes(data));
    }

    function renderQuotes(quotes) {
        quoteList.innerHTML = "";
        quotes.forEach(quote => {
            const li = document.createElement("li");
            li.classList.add("quote-card", "p-3");

            li.innerHTML = `
                <blockquote>
                    <p class="mb-0">${quote.quote}</p>
                    <footer class="blockquote-footer">${quote.author}</footer>
                    <br>
                    <button class='btn btn-success btn-sm' data-id="${quote.id}">Likes: <span>${quote.likes ? quote.likes.length : 0}</span></button>
                    <button class='btn btn-danger btn-sm' data-id="${quote.id}">Delete</button>
                    <button class='btn btn-warning btn-sm' data-id="${quote.id}">Edit</button>
                </blockquote>
            `;

            quoteList.appendChild(li);
        });
    }

    // Add a new quote
    quoteForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const newQuote = {
            quote: document.getElementById("new-quote").value,
            author: document.getElementById("author").value
        };

        fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newQuote)
        })
        .then(res => res.json())
        .then(() => {
            fetchQuotes();
            quoteForm.reset();
        });
    });

    // Handle button clicks (like, delete, edit)
    quoteList.addEventListener("click", (e) => {
        const id = e.target.dataset.id;

        // Like a quote
        if (e.target.classList.contains("btn-success")) {
            fetch("http://localhost:3000/likes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ quoteId: parseInt(id) })
            })
            .then(() => fetchQuotes());
        }

        // Delete a quote
        if (e.target.classList.contains("btn-danger")) {
            fetch(`${API_URL}/${id}`, { method: "DELETE" })
            .then(() => fetchQuotes());
        }

        // Edit a quote
        if (e.target.classList.contains("btn-warning")) {
            const quoteText = e.target.parentElement.querySelector("p").innerText;
            const authorText = e.target.parentElement.querySelector("footer").innerText;

            document.getElementById("new-quote").value = quoteText;
            document.getElementById("author").value = authorText;

            quoteForm.onsubmit = (event) => {
                event.preventDefault();
                fetch(`${API_URL}/${id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        quote: document.getElementById("new-quote").value,
                        author: document.getElementById("author").value
                    })
                })
                .then(() => {
                    fetchQuotes();
                    quoteForm.reset();
                    quoteForm.onsubmit = addNewQuote;
                });
            };
        }
    });

    // Fetch quotes on page load
    fetchQuotes();
});
