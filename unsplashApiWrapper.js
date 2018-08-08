class ApiWrapper {
	constructor(key = '1806d077d79d002fa842ccd4903cc0847dc06b34e8837b143e0084d84a62a68f') {
		this.client_id = key;
		this.responseCashe = new Map();
		this.callHistory = new CallHistory();
	}
	getPhotosByQuery(queryString, page = 1, perPage = 10) {
		
		let apiUrl = 'https://api.unsplash.com/search/photos';
		let queryParams = apiUrl + "%" + queryString + "%" + page;
		let callId = this.callHistory.addCall('getPhotosByQuery', new Map([
			['queryString', queryString],
			['page', page],
			['perPage', perPage],
		]))

		if (this.responseCashe.has(queryParams)) {
			return Promise.resolve({
				data: this.responseCashe.get(queryParams),
				callId: callId
			})

		} else {
			
			return jQuery.ajax({
				url: apiUrl,
				dataType: 'json',
				data: {
					client_id: this.client_id,
					query: queryString,
					page: page,
					per_page: perPage,

				},
				fail: console.log,
				success: (data) => this.responseCashe.set(queryParams, data.results),
				
			}).then((data) => (console.log(data),{
				data: data.results,
				callId: callId
			}))
		}
	}

	getRandomPhotos(queryString, count = 10) {
		let apiUrl = 'https://api.unsplash.com/photos/random';

		let callId = this.callHistory.addCall('getRandomPhotos', new Map([
			['queryString', queryString],
			['count', count]

		]))

		return jQuery.ajax({
			url: apiUrl,
			dataType: 'json',
			data: {
				client_id: this.client_id,
				//query: queryString,
				count: count,

			},
			fail: console.log,

		}).then((data) => ({
			data: data.results,
			callId: callId
		}))
	}

	getPhotosByUser(userName, page = 1, perPage = 3) {
		let apiUrl = `https://api.unsplash.com/users/${userName}/photos`;
		let queryParams = apiUrl + "%" + userName + "%" + page;
		let callId = this.callHistory.addCall('getPhotosByUser', new Map([
				['userName', userName],
				['page', page],
				['perPage', perPage],
			]))


		if (this.responseCashe.has(queryParams)) {
			return Promise.resolve({
				data: this.responseCashe.get(queryParams),
				callId: callId
			})

		} else {
			return jQuery.ajax({
				url: apiUrl,
				dataType: 'json',
				data: {
					client_id: this.client_id,
					page: page,
					per_page: perPage,
					order_by: 'popular',
				},
				fail: console.log,
				success: (data) => this.responseCashe.set(queryParams, data),
			}).then((data) => ({
				data: data,
				callId: callId
			}))
		}

	}

	getPhotosByPopularity(orderBy = 'popular', page = 1, perPage = 10) {
		
		let apiUrl = `https://api.unsplash.com/photos`;
		let queryParams = apiUrl + "%" + orderBy + "%" + page;
		let callId = this.callHistory.addCall('getPhotosByPopularity', new Map([
				['orderBy', orderBy],
				['page', page],
				['perPage', perPage],
			]))

		if (this.responseCashe.has(queryParams)) {
			return Promise.resolve({
				data: this.responseCashe.get(queryParams),
				callId: callId
			})
		} else {
			return jQuery.ajax({
				url: apiUrl,
				dataType: 'json',
				data: {
					client_id: this.client_id,
					page: page,
					per_page: perPage,
					order_by: orderBy,
				},
				fail: console.log,
				success: (data) => this.responseCashe.set(queryParams, data),

			}).then((data) => ({
				data: data,
				callId: callId
			}))
		}

	}

	getNextPagePhotos(callId) {
		let callDetails = this.callHistory.getCall(callId);
		let method = callDetails.method;
		let argsMap = callDetails.args;

		let args = [];

		argsMap.forEach((arg, key) => {
			if (key == "page") arg++;
			args.push(arg)
		});

		return this[method].apply(this, args)

	}
}
class CallHistory {
	constructor() {
		this.callStore = [];
	}

	addCall(method, args /*, response*/ ) {
		let callDetails = {
			method: method,
			args: args,
			//response: response,
		}
		this.callStore.push(callDetails)
		let callId = this.callStore.length - 1
		return callId;
	}

	getCall(callId) {
		if (callId >= this.callStore.length || callId < 0) {
			return new Error('invalid callId');
		}

		return this.callStore[callId];

	}


}
