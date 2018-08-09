let myApiWrapper = new ApiWrapper();

function populatePhotos(jsonArray, displayArea, callId, append = false) {
	if(jsonArray.length == 0){
		debugger;
		switch( $(displayArea).children('.image-card').length ){
				
			case 0:
				displayArea.append($('<p>').html('No Photos found'))
			default:
				displayArea.children('a.load-more').off()
				displayArea.children('a.load-more:visible').hide()
		}
		return
	}
	console.log(jsonArray)
	let images = jsonArray.reduce((divElmts, elem, i) => {
		let currentjQElem = $(`<div class="card p-0 image-card">
			<img class="card-img" src="${elem.urls.small}">
			<div class="card-img-overlay p-0">	
				<div class="photo-info-bottom text-white p-2">
					<img class="rounded-circle .img-fluid float-left mr-2" src="${elem.user.profile_image.small}">
					<h6 class="card-subtitle">${elem.user.name}</h5>
				</div>
			</div>
		</div>`);

		currentjQElem.click((e) => clickHandler(e, jsonArray, i))
		currentjQElem.hover((e) => hoverHandler.call(currentjQElem, e));

		return divElmts.add(currentjQElem);

	}, $(' '));


	$(displayArea).children('a.load-more').off().one('click', (e) => loadMoreHandler(e, callId))



	if (!append) {
		$(displayArea).children('*:not(".load-more")').remove()
	}

	$(displayArea).children('a.load-more').before(images)




}

function appendToPopulatedPhotos(jsonArray, displayArea, callId) {
	populatePhotos(jsonArray, displayArea, callId, true)

}

function hoverHandler(e) {
	$(this).find('.photo-info-bottom').fadeToggle("fast")
}

function loadMoreHandler(e, callId) {
	e.preventDefault();
	console.log(callId);
	let parentDisplayArea = $(e.target).closest('.display-area-deck')
	myApiWrapper.getNextPagePhotos(callId)
		.then((response) => appendToPopulatedPhotos(response.data, parentDisplayArea, response.callId))
}

function clickHandler(e, data, i) {

	let thisImageData = data[i]
	$('#content-selected').show().siblings('.content-area').hide(); // show the selected photos panel
	/*empty previous info*/
	
	/*display artist info on jumbotron*/
	let user = thisImageData.user;
	let generalTags = "trend modern woman man nature technology retro futuristic art stuff exotic rare beautiful"
	let querystring = thisImageData.tags ? thisImageData.tags.concat(thisImageData.photo_tags).reduce((r, e) => r + ' ' + e.title, '') : generalTags; //search using "all" keyword for untagged photos
	console.log(thisImageData);
	console.log(querystring);
	/*show selcted photo enlarged*/
	$('#selected-photo .selected-photo').attr('src', thisImageData.urls.regular);
	$('#selected-photo .photo-description').html(thisImageData.description);
	$('#selected-photo .photo-time').html('taken on ' + new Date(thisImageData.created_at).toLocaleDateString())
	
	/*show artist info and social networks*/
	$('#jumbotron-selected .user-photo').attr('src', thisImageData.user.profile_image.large);
	$('#jumbotron-selected .user-name').html(thisImageData.user.name);
	$('#jumbotron-selected .user-description').html(user.bio || " ");
	$('#jumbotron-selected .user-socialmedia').html(`<a href='https://twitter.com/${user.twitter_username}'>@ ${user.twitter_username}</a>`)
	$('#jumbotron-selected .user-location').html(user.location)
	/*display loadmore link */
	$('#load-more-same-artist').show()

	/*populate photos by same artist section*/
	myApiWrapper.getPhotosByUser(user.username, 1, 4)
		.then((response) => (console.log("related" + response), populatePhotos(response.data.filter((e) => e.id != thisImageData.id), $('#same-artist-deck'), response.callId), response)) //filter out current photo

	myApiWrapper.getPhotosByQuery(querystring, 1, 10)
		.then((response) => (populatePhotos(response.data.filter((e) => e.id != thisImageData.id), $('#related-deck'), response.callId), response)) //remove current image from list of related photos

	$(window).scrollTop(0);
}


$(() => {

	myApiWrapper.getPhotosByPopularity('latest', 1, 10)
		.then((response) => {
			populatePhotos(response.data, $("#home-deck"), response.callId);
			return response
		})
	$('form').submit(function (event) {
		event.preventDefault()

		$('#content-search').show().siblings('.content-area').hide()
		$('#search-results-deck').children('.image-card').remove()
		let queryString = $(this).find('.search-bar').val();
		console.log(queryString);
		
		myApiWrapper.getPhotosByQuery(queryString)
			.then(response => (populatePhotos(response.data, $('#search-results-deck'), response.callId), response))
	})

	$(window).scroll(function () {
		if ($(window).scrollTop() + $(window).height() > $(document).height() - 100) {
			$('.display-area-deck:not(#same-artist-deck) a.load-more').filter(':visible').trigger('click');
		}
	});


})
