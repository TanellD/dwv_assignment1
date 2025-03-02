document.addEventListener('DOMContentLoaded', () => {
    let moviesData = []; // store original movies data
    let filteredMovies = []; // store filtered movies data

    // declare maps globally
    const movieDirectorMap = new Map();
    const movieCountryMap = new Map();

    fetch('movies_database.json')
        .then(response => response.json())
        .then(data => {
            console.log('Loaded JSON Data:', data);

            const movies = data.movies;
            const authors = data.authors;
            const countries = data.countries;
            const movieAuthors = data.movie_authors;
            const movieCountries = data.movie_countries;

            // Populate the maps
            movieAuthors.forEach(ma => {
                const movieId = ma.movie_id;
                const author = authors.find(a => a.author_id === ma.author_id);
                if (author) {
                    if (!movieDirectorMap.has(movieId)) {
                        movieDirectorMap.set(movieId, []);
                    }
                    movieDirectorMap.get(movieId).push(author.author_name);
                }
            });

            movieCountries.forEach(mc => {
                const movieId = mc.movie_id;
                const country = countries.find(c => c.country_id === mc.country_id);
                if (country) {
                    if (!movieCountryMap.has(movieId)) {
                        movieCountryMap.set(movieId, []);
                    }
                    movieCountryMap.get(movieId).push(country.country_name);
                }
            });

            // store original movies data
            moviesData = movies.map(movie => ({
                ...movie,
                release_year: parseInt(movie.release_year, 10),
                box_office: parseInt(movie.box_office, 10)
            }));

            filteredMovies = [...moviesData];

            // populate table on page load
            populateTable(filteredMovies);

            // add event listeners for filters
            document.getElementById('titleFilter').addEventListener('input', filterTable);
            document.getElementById('directorFilter').addEventListener('input', filterTable);
            document.getElementById('countryFilter').addEventListener('input', filterTable);
            document.getElementById('yearFromFilter').addEventListener('input', filterTable);
            document.getElementById('yearToFilter').addEventListener('input', filterTable);

            // add event listeners for sorting
            document.querySelectorAll('.sort-arrow').forEach(arrow => {
                arrow.addEventListener('click', () => {
                    const column = arrow.getAttribute('data-column');
                    const currentOrder = arrow.getAttribute('data-order');
                    const newOrder = currentOrder === 'asc' ? 'desc' : 'asc';

                    // toggle data-order attribute
                    arrow.setAttribute('data-order', newOrder);
                    sortTable(column, newOrder);
                });
            });
        })
        .catch(error => console.error('Error loading JSON:', error));

    // function to populate the table
    const populateTable = (movies) => {
        const tableBody = document.querySelector('#moviesTable tbody');
        tableBody.innerHTML = '';
        movies.forEach(movie => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${movie.title}</td>
                <td>${movie.release_year}</td>
                <td>${movie.box_office}</td>
                <td>${movieDirectorMap.get(movie.movie_id)?.join(', ') || 'N/A'}</td>
                <td>${movieCountryMap.get(movie.movie_id)?.join(', ') || 'N/A'}</td>
            `;
            tableBody.appendChild(row);
        });
    };

    // function to filter movies
    const filterTable = () => {
        const titleValue = document.getElementById('titleFilter').value.toLowerCase();
        const directorValue = document.getElementById('directorFilter').value.toLowerCase();
        const countryValue = document.getElementById('countryFilter').value.toLowerCase();
        const yearFrom = parseInt(document.getElementById('yearFromFilter').value, 10) || 1900;
        const yearTo = parseInt(document.getElementById('yearToFilter').value, 10) || 2100;

        filteredMovies = moviesData.filter(movie => {
            const title = movie.title.toLowerCase();
            const directors = movieDirectorMap.get(movie.movie_id)?.join(', ').toLowerCase() || '';
            const countries = movieCountryMap.get(movie.movie_id)?.join(', ').toLowerCase() || '';
            const releaseYear = movie.release_year;

            return (
                title.includes(titleValue) &&
                directors.includes(directorValue) &&
                countries.includes(countryValue) &&
                releaseYear >= yearFrom &&
                releaseYear <= yearTo
            );
        });

        console.log('Filtered Movies:', filteredMovies);
        populateTable(filteredMovies);
    };

    // function to sort movies
    const sortTable = (column, order) => {
        filteredMovies.sort((a, b) => {
            let valueA = a[column];
            let valueB = b[column];

            // convert to lowercase for case-insensitive sorting (only for strings)
            if (typeof valueA === 'string') valueA = valueA.toLowerCase();
            if (typeof valueB === 'string') valueB = valueB.toLowerCase();

            if (order === 'asc') {
                return valueA > valueB ? 1 : -1;
            } else {
                return valueA < valueB ? 1 : -1;
            }
        });

        console.log(`Sorted by ${column} in ${order} order`);
        populateTable(filteredMovies);
    };
});
