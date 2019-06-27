const searchForm = document.querySelector('#search-form')
const movie = document.querySelector('#movies')
const urlPoster = 'https://image.tmdb.org/t/p/w500'
function apiSearch(event){
	event.preventDefault()
	const searchText = document.querySelector('#search-text').value
	if(searchText.trim().length === 0){
		movie.innerHTML = '<h2 class="col-12 text-center text-danger">Поле поиска не должно быть пустым</h2>'
		return
	}
	const server = 'https://api.themoviedb.org/3/search/multi?api_key=982295ace49e6e01b6d97a1fb4539451&language=ru&query=' + searchText
	movie.innerHTML = `<div class="spinner"></div>`
	// Через fetch
	fetch(server)
	.then(function(value){
		if(value.status !==200){
			return Promise.reject(new Error("Ошибка"))
		}
		return value.json()
	})
	.then(function(output){
		console.log(output.results)
		let inner = ''
		if(output.results.length === 0){
			inner = '<h2 class="col-12 text-center text-info">По вашему запросу ничего не найдено</h2>'
		}
		output.results.forEach(function(item){
			// console.log(item)
			let nameItem = item.name || item.title
			const poster = item.poster_path ? urlPoster + item.poster_path : './img/noposter.png'
			let dataInfo = ''
			if(item.media_type !== 'person') dataInfo = `data-id="${item.id}" data-type="${item.media_type}"`
				inner += 
			`<div class="col-12 col-md-6 col-xs-3 item">
			<img class="img-poster" src="${poster}" alt="${nameItem}" ${dataInfo}/>
			<h5>${nameItem}</h5>
			</div>`
		})
		movie.innerHTML = inner

		addEventMedia()
	})
	.catch(function(reason){
		movie.innerHTML = `<div class="col-12 col-md-6 col-xl-3">Упс, что-то пошло не так</div>`
		console.log('error: ' + reason)
	})
}
searchForm.addEventListener('submit', apiSearch)

function addEventMedia(){
	const media = movie.querySelectorAll('img[data-id]')
	media.forEach(function(elem){
		elem.style.cursor = 'pointer'
		elem.addEventListener('click', showFullInfo)
	})
}

function showFullInfo(){
	console.log(this.dataset.type)
	let url = ''
	if(this.dataset.type === 'movie'){
		url = 'https://api.themoviedb.org/3/movie/'+ this.dataset.id +'?api_key=982295ace49e6e01b6d97a1fb4539451&language=ru'
	}else if(this.dataset.type === 'tv'){
		url = 'https://api.themoviedb.org/3/tv/'+ this.dataset.id +'?api_key=982295ace49e6e01b6d97a1fb4539451&language=ru'
	}else{
		movie.innerHTML = '<h2 class="col-12 text-center text-info">Произошла ошибка, повторите позже</h2>'
	}

	fetch(url)
	.then(function(value){
		if(value.status !==200){
			return Promise.reject(new Error(value.status))
		}
		return value.json()
	})
	.then(function(output){
		// if(output.status === 'Ended'){
		// 	output.status = 'Закончился'
		// }else if(output.status === 'Released'){
		// 	output.status = 'Вышел'
		// }else{
		// 	output.status = output.status
		// }
		console.log(output)
		movie.innerHTML = `
		<h4 class="col-12 text-center text-info">${output.name || output.title}</h4>
		<div class="col-4">
		<img src="${urlPoster + output.poster_path}" alt="${output.name || output.title}" />
		${(output.homepage) ? `<p class="text-center"><a href="${output.homepage}" target="_blank">Официальная страница</a></p>` : ''}
		${(output.imdb_id) ? `<p class="text-center"><a href="https://imdb.com/title/${output.imdb_id}" target="_blank">Страница на IMDB.com</a></p>` : ''}
		</div>
		<div class="col-8">
		<p>Рейтинг: ${output.vote_average}</p>
		<p>Статус: ${output.status}</p>
		<p>Премьера: ${output.first_air_date || output.release_date}</p>
		${(output.last_episode_to_air) ? `<p>${output.number_of_seasons} сезон ${output.last_episode_to_air.episode_number} серий вышло</p>` : '' }
		<p><b>Описание:</b> <br>${output.overview}</p>
		<br>
		<div class="youtube"></div>
		</div>
		`
		getVideo(this.dataset.type, this.dataset.id)
	})
	.catch(function(reason){
		movie.innerHTML = `<div class="col-12 col-md-6 col-xl-3">Упс, что-то пошло не так</div>`
		console.error(reason || reason.status)
		// console.log('error: ' + reason)
	})
	// console.log(url)
}


function getVideo(type, id){
	let youtube = movie.querySelector(".youtube")

	fetch(`https://api.themoviedb.org/3/${type}/${id}/videos?api_key=982295ace49e6e01b6d97a1fb4539451&language=ru`)
	.then((value) => {
		if(value.status !==200){
			return Promise.reject(new Error(value.status))
		}
		return value.json()
	})
	.then((output) => {
		let videoFrame = '<h5 class="col-12 text-center text-info">Видео:</h5>'
		if(output.results.length === 0){
			videoFrame = '<p>К сожалению видео отсутствует</p>'
		}
		output.results.forEach((item)=>{
			videoFrame += '<iframe width="560" height="315" src="https://www.youtube.com/embed/' + item.key + '" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
		})
		// youtube.innerHTML = 'Работает'
		youtube.innerHTML = videoFrame
	})
	.catch((reason)=>{
		youtube.innerHTML = `<div class="col-12 col-md-6 col-xl-3">Видео отсутствует</div>`
		console.error(reason || reason.status)
	})
}

// Популярные фильмы за неделю
document.addEventListener('DOMContentLoaded', function(){
	// console.log('Ура загрузилась')
	// Через fetch
	fetch('https://api.themoviedb.org/3/trending/all/week?api_key=982295ace49e6e01b6d97a1fb4539451')
	.then(function(value){
		if(value.status !==200){
			return Promise.reject(new Error("Ошибка"))
		}
		return value.json()
	})
	.then(function(output){
		// console.log(output.results)
		let inner = '<h4 class="col-12 text-center text-info">Популярные за неделю:</h4>'
		if(output.results.length === 0){
			inner = '<h2 class="col-12 text-center text-info">По вашему запросу ничего не найдено</h2>'
		}
		output.results.forEach(function(item){
			// console.log(item)
			let nameItem = item.name || item.title
			let mediaType = item.title ? 'movie' : 'tv'
			const poster = item.poster_path ? urlPoster + item.poster_path : './img/noposter.png'
			let dataInfo = `data-id="${item.id}" data-type="${mediaType}"`
			inner += 
			`<div class="col-12 col-md-6 col-xl-3 item">
			<img class="img-poster" src="${poster}" alt="${nameItem}" ${dataInfo}/>
			<h5>${nameItem}</h5>
			</div>`
		})
		movie.innerHTML = inner

		addEventMedia()
	})
	.catch(function(reason){
		movie.innerHTML = `<div class="col-12 col-md-6 col-xs-3">Упс, что-то пошло не так</div>`
		console.log('error: ' + reason)
	})
})