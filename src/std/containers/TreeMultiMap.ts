﻿/// <reference path="../API.ts" />

/// <reference path="../base/containers/MultiMap.ts" />

namespace std.TreeMultiMap
{
	export type iterator<Key, T> = MapIterator<Key, T>;
	export type reverse_iterator<Key, T> = MapReverseIterator<Key, T>;
}

namespace std
{
	export class TreeMultiMap<Key, T>
		extends base.MultiMap<Key, T>
		implements base.ITreeMap<Key, T>
	{
		/**
		 * @hidden
		 */
		private tree_: base._MultiMapTree<Key, T>;

		/* =========================================================
			CONSTRUCTORS & SEMI-CONSTRUCTORS
				- CONSTRUCTORS
				- ASSIGN & CLEAR
		============================================================
			CONSTURCTORS
		--------------------------------------------------------- */
		public constructor();

		public constructor(compare: (x: Key, y: Key) => boolean);

		public constructor(array: Array<Pair<Key, T>>);

		public constructor(array: Array<Pair<Key, T>>, compare: (x: Key, y: Key) => boolean);

		public constructor(array: Array<[Key, T]>);

		public constructor(array: Array<[Key, T]>, compare: (x: Key, y: Key) => boolean);

		public constructor(container: TreeMultiMap<Key, T>);

		public constructor(container: TreeMultiMap<Key, T>, compare: (x: Key, y: Key) => boolean);

		public constructor(begin: base.Iterator<Pair<Key, T>>, end: base.Iterator<Pair<Key, T>>);

		public constructor
		(
			begin: base.Iterator<Pair<Key, T>>, end: base.Iterator<Pair<Key, T>>, compare: (x: Key, y: Key) => boolean
		);

		public constructor(...args: any[])
		{
			super();

			//--------
			// SPECIFIY CONSTRUCTOR
			//--------
			let compare: (x: Key, y: Key) => boolean = less;
			let fn: Function = null;

			if (args.length >= 1 && args[0] instanceof TreeMultiMap)
			{
				// COPY CONSTRUCTOR
				let container: TreeMultiMap<Key, T> = args[0]; // PARAMETER
				if (args.length == 2) // SPECIFIED COMPARISON FUNCTION
					compare = args[1];

				fn = this.assign.bind(this, container.begin(), container.end());
			}
			else if (args.length >= 1 && args[0] instanceof Array)
			{
				// INITIALIZER LIST CONSTRUCTOR
				let items: Pair<Key, T>[] = args[0]; // PARAMETER
				if (args.length == 2) // SPECIFIED COMPARISON FUNCTION
					compare = args[1];

				fn = this.push.bind(this, ...items);
			}
			else if (args.length >= 2 && args[0] instanceof base.Iterator && args[1] instanceof base.Iterator)
			{
				// RANGE CONSTRUCTOR
				let first: base.Iterator<Pair<Key, T>> = args[0]; // PARAMETER 1
				let last: base.Iterator<Pair<Key, T>> = args[1]; // PARAMETER 2
				if (args.length == 3) // SPECIFIED COMPARISON FUNCTION
					compare = args[2];

				fn = this.assign.bind(this, first, last);
			}
			else if (args.length == 1)
			{
				// DEFAULT CONSTRUCTOR WITH SPECIFIED COMPARISON FUNCTION
				compare = args[0];
			}

			//--------
			// ADJUST THE SPECIFIED CONSTRUCTOR
			//--------
			this.tree_ = new base._MultiMapTree<Key, T>(this, compare);
			if (fn != null)
				fn();
		}

		/* ---------------------------------------------------------
			ASSIGN & CLEAR
		--------------------------------------------------------- */
		public clear(): void
		{
			super.clear();

			this.tree_.clear();
		}

		/* =========================================================
			ACCESSORS
		========================================================= */
		public find(key: Key): MapIterator<Key, T>
		{
			let node: base._XTreeNode<MapIterator<Key, T>> = this.tree_.find_by_key(key);
			
			if (node == null || equal_to(node.value.first, key) == false)
				return this.end();
			else
				return node.value;
		}

		public count(key: Key): number
		{
			let it = this.find(key);
			let cnt: number = 0;

			for (; !it.equals(this.end()) && equal_to(it.first, key); it = it.next())
				cnt++;

			return cnt;
		}

		public key_comp(): (x: Key, y: Key) => boolean
		{
			return this.tree_.key_comp();
		}

		public value_comp(): (x: Pair<Key, T>, y: Pair<Key, T>) => boolean
		{
			return this.tree_.value_comp();
		}

		public lower_bound(key: Key): MapIterator<Key, T>
		{
			return this.tree_.lower_bound(key);
		}

		public upper_bound(key: Key): MapIterator<Key, T>
		{
			return this.tree_.upper_bound(key);
		}

		public equal_range(key: Key): Pair<MapIterator<Key, T>, MapIterator<Key, T>>
		{
			return this.tree_.equal_range(key);
		}

		/* =========================================================
			ELEMENTS I/O
				- INSERT
				- POST-PROCESS
				- SWAP
		============================================================
			INSERT
		--------------------------------------------------------- */
		/**
		 * @hidden
		 */
		protected _Insert_by_pair(pair: Pair<Key, T>): MapIterator<Key, T>
		{
			// FIND POSITION TO INSERT
			let it: MapIterator<Key, T> = this.upper_bound(pair.first);

			// ITERATOR TO RETURN
			it = this["data_"].insert(it, pair);
			this._Handle_insert(it, it.next()); // POST-PROCESS

			return it;
		}

		/**
		 * @hidden
		 */
		protected _Insert_by_hint(hint: MapIterator<Key, T>, pair: Pair<Key, T>): MapIterator<Key, T>
		{
			let key: Key = pair.first;

			//--------
			// INSERT BRANCH
			//--------
			// prev < current < hint
			let prev: MapIterator<Key, T> = hint.prev();
			let keys: Vector<Key> = new Vector<Key>();

			// CONSTRUCT KEYS
			if (!prev.equals(this.end()) && !equal_to(prev.first, key))
				keys.push_back(prev.first); // NOT END() AND DIFFERENT WITH KEY

			keys.push_back(key); // NEW ITEM'S KEY

			if (!hint.equals(this.end()) && !equal_to(hint.first, key))
				keys.push_back(hint.first);

			// IS THE HINT VALID ?
			let ret: MapIterator<Key, T>;
			
			if (is_sorted(keys.begin(), keys.end(), this.key_comp()))
			{
				// CORRECT HINT
				ret = this["data_"].insert(hint, pair);

				// POST-PROCESS
				this._Handle_insert(ret, ret.next());
			}
			else // INVALID HINT
				ret = this._Insert_by_pair(pair);

			return ret;
		}

		/**
		 * @hidden
		 */
		protected _Insert_by_range<L extends Key, U extends T, InputIterator extends base.Iterator<Pair<L, U>>>
			(first: InputIterator, last: InputIterator): void
		{
			for (; !first.equals(last); first = first.next() as InputIterator)
				this._Insert_by_pair(make_pair<Key, T>(first.value.first, first.value.second));
		}

		/* ---------------------------------------------------------
			POST-PROCESS
		--------------------------------------------------------- */
		/**
		 * @hidden
		 */
		protected _Handle_insert(first: MapIterator<Key, T>, last: MapIterator<Key, T>): void
		{
			this.tree_.insert(first);
		}

		/**
		 * @hidden
		 */
		protected _Handle_erase(first: MapIterator<Key, T>, last: MapIterator<Key, T>): void
		{
			for (; !first.equals(last); first = first.next())
				this.tree_.erase(first);
		}

		/* ---------------------------------------------------------
			SWAP
		--------------------------------------------------------- */
		public swap(obj: TreeMultiMap<Key, T>): void;

		public swap(obj: base.Container<Pair<Key, T>>): void;

		public swap(obj: TreeMultiMap<Key, T> | base.Container<Pair<Key, T>>): void
		{
			if (obj instanceof TreeMultiMap && this.key_comp() == obj.key_comp())
			{
				this._Swap(obj);
				[this.tree_, obj.tree_] = [obj.tree_, this.tree_];
			}
			else
				super.swap(obj);
		}
	}
}