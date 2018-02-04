/* eslint-disable */
import { initializeApp } from 'firebase'

const app = initializeApp({
	apiKey: 'AIzaSyCF2qS9tThleB4k8GgPgF3KSItn4BH8LFU',
	authDomain: 'players-data.firebaseapp.com',
	databaseURL: 'https://players-data.firebaseio.com',
	projectId: 'players-data',
	storageBucket: 'players-data.appspot.com',
	messagingSenderId: '543455106839'
})

export const db = app.database()
export const players = db.ref('players')
