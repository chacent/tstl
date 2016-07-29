/// <reference path="API.ts" />

/// <reference path="base/UniqueMap.ts" />
/// <reference path="base/MultiMap.ts" />

namespace std.HashMap
{
	export type iterator<Key, T> = std.MapIterator<Key, T>;
	export type reverse_iterator<Key, T> = std.MapReverseIterator<Key, T>;
}

namespace std
{
	/**
	 * <p> Hashed, unordered map. </p>
	 *
	 * <p> {@link HashMap}s are associative containers that store elements formed by the combination of a <i>key value</i> 
	 * and a <i>mapped value</i>, and which allows for fast retrieval of individual elements based on their <i>keys</i>. 
	 * </p>
	 *
	 * <p> In an {@link HashMap}, the <i>key value</i> is generally used to uniquely identify the element, while the 
	 * <i>mapped value</i> is an object with the content associated to this <i>key</i>. Types of <i>key</i> and 
	 * <i>mapped value</i> may differ. </p>
	 *
	 * <p> Internally, the elements in the {@link HashMap} are not sorted in any particular order with respect to either 
	 * their <i>key</i> or <i>mapped values</i>, but organized into <i>buckets</i> depending on their hash values to allow 
	 * for fast access to individual elements directly by their <i>key values</i> (with a constant average time complexity 
	 * on average). </p>
	 *
	 * <p> {@link HashMap} containers are faster than {@link TreeMap} containers to access individual elements by their 
	 * <i>key</i>, although they are generally less efficient for range iteration through a subset of their elements. </p>
	 *
	 * <p> <a href="http://samchon.github.io/typescript-stl/images/design/class_diagram/map_containers.png" target="_blank"> 
	 * <img src="http://samchon.github.io/typescript-stl/images/design/class_diagram/map_containers.png" style="max-width: 100%" /> </a> 
	 * </p>
	 * 
	 * <h3> Container properties </h3>
	 * <dl>
	 * 	<dt> Associative </dt>
	 * 	<dd> Elements in associative containers are referenced by their <i>key</i> and not by their absolute 
	 *		 position in the container. </dd>
	 * 
	 * 	<dt> Hashed </dt>
	 * 	<dd> Hashed containers organize their elements using hash tables that allow for fast access to elements 
	 *		 by their <i>key</i>. </dd>
	 * 
	 * 	<dt> Map </dt>
	 * 	<dd> Each element associates a <i>key</i> to a <i>mapped value</i>: 
	 *		 <i>Keys</i> are meant to identify the elements whose main content is the <i>mapped value</i>. </dd>
	 * 
	 * 	<dt> Unique keys </dt>
	 * 	<dd> No two elements in the container can have equivalent keys. </dd>
	 * </dl>
	 *
	 * @param <Key> Type of the key values. 
	 *				Each element in an {@link HashMap} is uniquely identified by its key value.
	 * @param <T> Type of the mapped value. 
	 *			  Each element in an {@link HashMap} is used to store some data as its mapped value.
	 *
	 * @reference http://www.cplusplus.com/reference/unordered_map/unordered_map
	 * @author Jeongho Nam <http://samchon.org>
	 */
	export class HashMap<Key, T>
		extends base.UniqueMap<Key, T>
		implements base.IHashMap<Key, T>
	{
		/**
		 * @hidden
		 */
		private hash_buckets_: base.MapHashBuckets<Key, T>;
	
		/* =========================================================
			CONSTRUCTORS & SEMI-CONSTRUCTORS
				- CONSTRUCTORS
				- ASSIGN & CLEAR
		============================================================
			CONSTURCTORS
		--------------------------------------------------------- */
		/////
		// using super::constructor
		/////

		/**
		 * @hidden
		 */
		protected init(): void
		{
			super.init();

			this.hash_buckets_ = new base.MapHashBuckets<Key, T>(this);
		}

		/**
		 * @hidden
		 */
		protected construct_from_array(items: Array<Pair<Key, T>>): void
		{
			this.hash_buckets_.rehash(items.length * base.Hash.RATIO);

			super.construct_from_array(items);
		}
		
		/* ---------------------------------------------------------
			ASSIGN & CLEAR
		--------------------------------------------------------- */
		/**
		 * @inheritdoc
		 */
		public clear(): void
		{
			this.hash_buckets_.clear();

			super.clear();
		}

		/* =========================================================
			ACCESSORS
				- MEMBER
				- HASH
		============================================================
			MEMBER
		--------------------------------------------------------- */
		/**
		 * @inheritdoc
		 */
		public find(key: Key): MapIterator<Key, T>
		{
			return this.hash_buckets_.find(key);
		}

		/**
		 * @inheritdoc
		 */
		public begin(): MapIterator<Key, T>;

		/**
		 * @inheritdoc
		 */
		public begin(index: number): MapIterator<Key, T>;

		public begin(index?: number): MapIterator<Key, T>
		{
			if (index == undefined)
				return super.begin();
			else
				return this.hash_buckets_.at(index).front();
		}

		/**
		 * @inheritdoc
		 */
		public end(): MapIterator<Key, T>;

		/**
		 * @inheritdoc
		 */
		public end(index: number): MapIterator<Key, T>

		public end(index?: number): MapIterator<Key, T>
		{
			if (index == undefined)
				return super.end();
			else
				return this.hash_buckets_.at(index).back().next();
		}

		/**
		 * @inheritdoc
		 */
		public rbegin(): MapReverseIterator<Key, T>;

		/**
		 * @inheritdoc
		 */
		public rbegin(index: number): MapReverseIterator<Key, T>;

		public rbegin(index?: number): MapReverseIterator<Key, T>
		{
			if (index == undefined)
				return super.rbegin();
			else
				return new MapReverseIterator<Key, T>(this.end(index));
		}

		/**
		 * @inheritdoc
		 */
		public rend(): MapReverseIterator<Key, T>;

		/**
		 * @inheritdoc
		 */
		public rend(index: number): MapReverseIterator<Key, T>;

		public rend(index?: number): MapReverseIterator<Key, T>
		{
			if (index == undefined)
				return super.rend();
			else
				return new MapReverseIterator<Key, T>(this.begin(index));
		}

		/* ---------------------------------------------------------
			HASH
		--------------------------------------------------------- */
		/**
		 * @inheritdoc
		 */
		public bucket_count(): number
		{
			return this.hash_buckets_.size();
		}

		/**
		 * @inheritdoc
		 */
		public bucket_size(index: number): number
		{
			return this.hash_buckets_.at(index).size();
		}

		/**
		 * @inheritdoc
		 */
		public max_load_factor(): number;

		/**
		 * @inheritdoc
		 */
		public max_load_factor(z: number): void;

		public max_load_factor(z?: number): any
		{
			if (z == undefined)
				return this.size() / this.bucket_count();
			else
				this.rehash(Math.ceil(this.bucket_count() / z));
		}

		/**
		 * @inheritdoc
		 */
		public bucket(key: Key): number
		{
			return std.hash(key) % this.hash_buckets_.size();
		}

		/**
		 * @inheritdoc
		 */
		public reserve(n: number): void
		{
			this.hash_buckets_.rehash(Math.ceil(n * this.max_load_factor()));
		}

		/**
		 * @inheritdoc
		 */
		public rehash(n: number): void
		{
			if (n <= this.bucket_count())
				return;

			this.hash_buckets_.rehash(n);
		}

		/* =========================================================
			ELEMENTS I/O
				- INSERT
				- POST-PROCESS
		============================================================
			INSERT
		--------------------------------------------------------- */
		/**
		 * @hidden
		 */
		protected insert_by_pair(pair: Pair<Key, T>): any
		{
			// TEST WHETHER EXIST
			let it = this.find(pair.first);
			if (it.equal_to(this.end()) == false)
				return make_pair(it, false);

			// INSERT
			this.data_.push_back(pair);
			it = it.prev();

			// POST-PROCESS
			this.handle_insert(it, it.next());

			return make_pair(it, true);
		}

		/**
		 * @hidden
		 */
		protected insert_by_hint(hint: MapIterator<Key, T>, pair: Pair<Key, T>): MapIterator<Key, T>
		{
			// FIND KEY
			if (this.has(pair.first) == true)
				return this.end();

			// INSERT
			let list_it = this.data_.insert(hint.get_list_iterator(), pair);

			// POST-PROCESS
			let it = new MapIterator<Key, T>(this, list_it);
			this.handle_insert(it, it.next());

			return it;
		}

		/**
		 * @hidden
		 */
		protected insert_by_range<L extends Key, U extends T, InputIterator extends Iterator<Pair<L, U>>>
			(first: InputIterator, last: InputIterator): void
		{
			let my_first: MapIterator<Key, T> = this.end().prev();
			let size: number = 0;

			// INSERT ELEMENTS
			for (; !first.equal_to(last); first = first.next() as InputIterator)
			{
				// TEST WHETER EXIST
				if (this.has(first.value.first))
					continue;

				// INSERTS
				this.data_.push_back(make_pair<Key, T>(first.value.first, first.value.second));
				size++;
			}
			my_first = my_first.next();

			// IF NEEDED, HASH_BUCKET TO HAVE SUITABLE SIZE
			if (this.size() + size > this.hash_buckets_.size() * base.Hash.MAX_RATIO)
				this.hash_buckets_.rehash((this.size() + size) * base.Hash.RATIO);

			// POST-PROCESS
			this.handle_insert(my_first, this.end());
		}

		/* ---------------------------------------------------------
			POST-PROCESS
		--------------------------------------------------------- */
		/**
		 * @inheritdoc
		 */
		protected handle_insert(first: MapIterator<Key, T>, last: MapIterator<Key, T>): void
		{
			for (; !first.equal_to(last); first = first.next())
				this.hash_buckets_.insert(first);
		}

		/**
		 * @inheritdoc
		 */
		protected handle_erase(first: MapIterator<Key, T>, last: MapIterator<Key, T>): void
		{
			for (; !first.equal_to(last); first = first.next())
				this.hash_buckets_.erase(first);
		}

		/* ===============================================================
			UTILITIES
		=============================================================== */
		/**
		 * @inheritdoc
		 */
		public swap(obj: base.UniqueMap<Key, T>): void
		{
			if (obj instanceof HashMap)
				this.swap_hash_map(obj);
			else
				super.swap(obj);
		}

		/**
		 * @hidden
		 */
		private swap_hash_map(obj: HashMap<Key, T>): void
		{
			[this.data_, obj.data_] = [obj.data_, this.data_];
			[this.hash_buckets_, obj.hash_buckets_] = [obj.hash_buckets_, this.hash_buckets_];
		}
	}
}