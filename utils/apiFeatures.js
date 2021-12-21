class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // 1a. Filtering
    //make a copy of the query object.
    //const queryObj = {...req.query};
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    const queryObj = { ...this.queryString };
    // console.log(this.query);
    // console.log(queryObj);
    //array of fields that we want to delete from queryObj.
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    //for each field in excludedFields, delete it from the queryObj
    //ForEach because we don't want to save a new array
    excludedFields.forEach((el) => delete queryObj[el]);

    //console.log(this.queryString);

    //mongoose methods.
    //find returns a query that's why we are able to chain the below methods.

    // 1b. Advanced filtering.
    //convert obj to string.
    // use let so we can transmute queryStr.
    let queryStr = JSON.stringify(queryObj);

    //{ duration: { gte: '5' }, difficulty: 'easy' }
    // { difficulty: 'easy', duration: {$gte: 5}}
    // gte, gt, lte, lt
    // \b any of these, /g all occurances,
    // replace the match with $match
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    //console.log(JSON.parse(queryStr));

    this.query = this.query.find(JSON.parse(queryStr));
    //let query = Tour.find(JSON.parse(queryStr));

    //return the object after filtering.
    return this;
  }

  sort() {
    //2. Sorting, sort=-, on the query will cause a descending sort.
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      //console.log(sortBy);
      this.query = this.query.sort(sortBy);
      // sort('price ratingsAverage')
    } else {
      //default sort criteria, if none specified.
      //this.query = this.query.sort('-createdAt');
      //had to adjust default sorting to _id for paging to work.
      this.query = this.query.sort('_id');
    }

    //return the object after sorting.
    return this;
  }

  limitFields() {
    // 3. Field limiting.
    if (this.queryString.fields) {
      console.log('field limiting...');
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      //default.
      // - minus prefix excludes that field.
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    //4. Paginations.
    //page=2&limit=10, page 1: 1-10, page 2: 11-20, page 3 21-30
    //we will calculate the skip value based on page value
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    //console.log(page);
    //console.log(skip);

    this.query = this.query.skip(skip).limit(limit);

    // //check if paging beyond number of available pages.
    // if(this.queryString.page) {
    //     const numTours = await Tour.countDocuments();
    //     if(skip >= numTours) throw new Error('This page does not exist');
    // }
    return this;
  }
}

module.exports = APIFeatures;
