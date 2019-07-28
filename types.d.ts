interface AsteroidRequest {
    dateStart:Date,
    dateEnd:Date,
    within: {
        value:Number,
        units?:String
    }
}