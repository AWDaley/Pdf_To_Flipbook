//#region \0rolldown/runtime.js
var e = (e, t) => () => (t || (e((t = { exports: {} }).exports, t), e = null), t.exports);
//#endregion
//#region node_modules/zod/v4/core/util.js
function t(e) {
	let t = Object.values(e).filter((e) => typeof e == "number");
	return Object.entries(e).filter(([e, n]) => t.indexOf(+e) === -1).map(([e, t]) => t);
}
function n(e, t = "|") {
	return e.map((e) => oe(e)).join(t);
}
function r(e, t) {
	return typeof t == "bigint" ? t.toString() : t;
}
var i = class {
	constructor(e) {
		this._getter = e, this._value = void 0;
	}
	get value() {
		let e = this._getter;
		return e !== void 0 && (this._value = e(), this._getter = void 0), this._value;
	}
};
function a(e) {
	return new i(e);
}
function o(e) {
	return e == null;
}
function s(e) {
	let t = +!!e.startsWith("^"), n = e.endsWith("$") ? e.length - 1 : e.length;
	return e.slice(t, n);
}
function c(e, t) {
	let n = e / t, r = Math.round(n), i = 4 * 2 ** -52 * Math.max(Math.abs(n), 1);
	return Math.abs(n - r) < i ? 0 : n - r;
}
function l(e, t, n) {
	Object.defineProperty(e, t, {
		value: n,
		writable: !0,
		enumerable: !0,
		configurable: !0
	});
}
function u(e) {
	let t = Object.getOwnPropertyDescriptor(e, "shape");
	return t?.get ? t.get.raw : t?.value;
}
function d(e) {
	return u(e._zod.def) ?? e._zod.def.shape;
}
function f(e, t, n) {
	Object.defineProperty(e, t, {
		get() {
			let e = n();
			return l(this, t, e), e;
		},
		enumerable: !0,
		configurable: !0
	});
}
function p(e, t, n) {
	t in e ? l(e, t, n) : e[t] = n;
}
function m(e, t, n, r) {
	let i = d(t);
	for (let a of n) {
		let n = Object.getOwnPropertyDescriptor(i, a);
		n.enumerable && (n.get ? f(e, a, () => {
			let e = t._zod.def.shape[a];
			return r ? r(e, a) : e;
		}) : p(e, a, r ? r(n.value, a) : n.value));
	}
}
function h(e, t) {
	for (let n of Reflect.ownKeys(t)) {
		let r = Object.getOwnPropertyDescriptor(t, n);
		r.enumerable && (r.get ? f(e, n, () => t[n]) : p(e, n, r.value));
	}
}
function g(...e) {
	let t = {};
	for (let n of e) {
		let e = Object.getOwnPropertyDescriptors(n);
		Object.assign(t, e);
	}
	return Object.defineProperties({}, t);
}
function ee(e) {
	return JSON.stringify(e);
}
function te(e) {
	return e.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}
var ne = "captureStackTrace" in Error ? Error.captureStackTrace : (...e) => {};
function _(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
var re = /* @__PURE__*/ a(() => {
	if (j.jitless || typeof navigator < "u" && navigator?.userAgent?.includes("Cloudflare")) return !1;
	try {
		return Function(""), !0;
	} catch {
		return !1;
	}
});
function v(e) {
	if (_(e) === !1) return !1;
	let t = e.constructor;
	if (t === void 0 || typeof t != "function") return !0;
	let n = t.prototype;
	return _(n) !== !1 && Object.prototype.hasOwnProperty.call(n, "isPrototypeOf") !== !1;
}
function ie(e) {
	return v(e) ? { ...e } : Array.isArray(e) ? [...e] : e instanceof Map ? new Map(e) : e instanceof Set ? new Set(e) : e;
}
var ae = /* @__PURE__*/ new Set([
	"string",
	"number",
	"symbol"
]);
function y(e) {
	return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function b(e, t, n) {
	let r = new e._zod.constr(t ?? e._zod.def);
	return (!t || n?.parent) && (r._zod.parent = e), r;
}
function x(e) {
	let t = e;
	if (!t) return {};
	if (typeof t == "string") return { error: () => t };
	if (t?.message !== void 0) {
		if (t?.error !== void 0) throw Error("Cannot specify both `message` and `error` params");
		t.error = t.message;
	}
	return delete t.message, typeof t.error == "string" ? {
		...t,
		error: () => t.error
	} : t;
}
function oe(e) {
	return typeof e == "bigint" ? e.toString() + "n" : typeof e == "string" ? `"${e}"` : `${e}`;
}
function se(e) {
	return Object.keys(e).filter((t) => e[t]._zod.optin !== void 0 && e[t]._zod.optout === "optional");
}
var ce = {
	safeint: [-(2 ** 53 - 1), 2 ** 53 - 1],
	int32: [-2147483648, 2147483647],
	uint32: [0, 4294967295],
	float32: [-34028234663852886e22, 34028234663852886e22],
	float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
}, le = {
	int64: [/* @__PURE__*/ BigInt("-9223372036854775808"), /* @__PURE__*/ BigInt("9223372036854775807")],
	uint64: [/* @__PURE__*/ BigInt(0), /* @__PURE__*/ BigInt("18446744073709551615")]
};
function ue(e, t) {
	let n = e._zod.def, r = n.checks;
	if (r && r.length > 0) throw Error(".pick() cannot be used on object schemas containing refinements");
	let i = {};
	return m(i, e, de(e, t)), b(e, g(n, {
		shape: i,
		checks: []
	}));
}
function de(e, t) {
	let n = d(e), r = [];
	for (let e of Reflect.ownKeys(t)) {
		if (!Object.getOwnPropertyDescriptor(n, e)?.enumerable) throw Error(`Unrecognized key: "${String(e)}"`);
		t[e] && r.push(e);
	}
	return r;
}
function fe(e, t) {
	let n = e._zod.def, r = n.checks;
	if (r && r.length > 0) throw Error(".omit() cannot be used on object schemas containing refinements");
	let i = new Set(de(e, t)), a = {};
	return m(a, e, Reflect.ownKeys(d(e)).filter((e) => !i.has(e))), b(e, g(n, {
		shape: a,
		checks: []
	}));
}
function pe(e, t) {
	if (!v(t)) throw Error("Invalid input to extend: expected a plain object");
	let n = e._zod.def.checks;
	if (n && n.length > 0) {
		let n = d(e);
		for (let e of Reflect.ownKeys(t)) if (Object.getOwnPropertyDescriptor(n, e) !== void 0) throw Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
	}
	return b(e, g(e._zod.def, { shape: me(e, t) }));
}
function me(e, t) {
	let n = {};
	return m(n, e, Reflect.ownKeys(d(e))), h(n, t), n;
}
function he(e, t) {
	if (!v(t)) throw Error("Invalid input to safeExtend: expected a plain object");
	return b(e, g(e._zod.def, { shape: me(e, t) }));
}
function ge(e, t) {
	if (!t?._zod?.def) throw Error("Invalid input to merge: expected an object schema. To merge a plain shape, use `.extend()`.");
	if (e._zod.def.checks?.length) throw Error(".merge() cannot be used on object schemas containing refinements. Use .safeExtend() instead.");
	let n = {};
	return m(n, e, Reflect.ownKeys(d(e))), m(n, t, Reflect.ownKeys(d(t))), b(e, g(e._zod.def, {
		shape: n,
		get catchall() {
			return t._zod.def.catchall;
		},
		checks: t._zod.def.checks ?? []
	}));
}
function _e(e, t, n, r = "partial") {
	let i = t._zod.def.checks;
	if (i && i.length > 0) throw Error(`.${r}() cannot be used on object schemas containing refinements`);
	let a = n ? new Set(de(t, n)) : void 0, o = {};
	return m(o, t, Reflect.ownKeys(d(t)), e && ((t, n) => a && !a.has(n) ? t : new e({
		type: "optional",
		innerType: t
	}))), b(t, g(t._zod.def, {
		shape: o,
		checks: []
	}));
}
function ve(e, t, n) {
	let r = n ? new Set(de(t, n)) : void 0, i = {};
	return m(i, t, Reflect.ownKeys(d(t)), (t, n) => r && !r.has(n) ? t : new e({
		type: "nonoptional",
		innerType: t
	})), b(t, g(t._zod.def, { shape: i }));
}
function S(e, t = 0) {
	if (e.aborted === !0) return !0;
	for (let n = t; n < e.issues.length; n++) if (e.issues[n]?.continue !== !0) return !0;
	return !1;
}
function ye(e, t = 0) {
	if (e.aborted === !0) return !0;
	for (let n = t; n < e.issues.length; n++) if (e.issues[n]?.continue === !1) return !0;
	return !1;
}
function be(e, t) {
	return t.map((t) => {
		var n;
		return (n = t).path ?? (n.path = []), t.path.unshift(e), t;
	});
}
function C(e) {
	return typeof e == "string" ? e : e?.message;
}
function xe(e, t, n) {
	var r;
	for (let i = t; i < e.length; i++) (r = e[i]).schema ?? (r.schema = n);
}
function w(e, t, n) {
	var r;
	let i = e.inst?._zod?.traits;
	i?.has("$ZodType") && (i.has("$ZodCheck") ? (r = e).schema ?? (r.schema = e.inst) : e.schema = e.inst);
	let a = e.schema === e.inst ? void 0 : e.schema?._zod.def?.error, o = e.message ? e.message : C(e.inst?._zod.def?.error?.(e)) ?? C(a?.(e)) ?? C(t?.error?.(e)) ?? C(n.customError?.(e)) ?? C(n.localeError?.(e)) ?? "Invalid input", s = {};
	for (let t of Object.keys(e)) t !== "inst" && t !== "schema" && t !== "continue" && t !== "input" && t !== "__proto__" && (s[t] = e[t]);
	return s.path ??= [], s.message = o, t?.reportInput && (s.input = e.input), s;
}
var Se = /[\uD800-\uDBFF]/;
function Ce(e) {
	let t = e.length;
	if (!Se.test(e)) return t;
	let n = t;
	for (let r = 0; r < t - 1; r++) (e.charCodeAt(r) & 64512) == 55296 && (e.charCodeAt(r + 1) & 64512) == 56320 && (n--, r++);
	return n;
}
function we(e) {
	return Array.isArray(e) ? "array" : typeof e == "string" ? "string" : "unknown";
}
function Te(e) {
	let t = typeof e;
	switch (t) {
		case "number": return Number.isNaN(e) ? "nan" : "number";
		case "object": {
			if (e === null) return "null";
			if (Array.isArray(e)) return "array";
			let t = e;
			if (t && Object.getPrototypeOf(t) !== Object.prototype && "constructor" in t && t.constructor) return t.constructor.name;
		}
	}
	return t;
}
function T(...e) {
	let [t, n, r] = e;
	return typeof t == "string" ? {
		message: t,
		code: "custom",
		input: n,
		inst: r
	} : { ...t };
}
function Ee(e, t) {
	for (let n in t) {
		let r = Object.getOwnPropertyDescriptor(t, n);
		r.get ? Object.defineProperty(e, n, {
			...r,
			enumerable: !1
		}) : ke(e, n, r.value);
	}
}
function E(e, t, n, r = !0) {
	return Object.defineProperty(e, t, {
		configurable: !0,
		writable: !0,
		enumerable: r,
		value: n
	}), n;
}
function De(e, t, n) {
	return E(e, t, n, !1);
}
function Oe(e, t) {
	for (let n in e) {
		let r = e[n];
		Object.defineProperty(t, n, {
			configurable: !0,
			enumerable: !0,
			get() {
				return E(this, n, r(this));
			},
			set(e) {
				E(this, n, e);
			}
		});
	}
	return t;
}
function ke(e, t, n) {
	Object.defineProperty(e, t, {
		configurable: !0,
		get() {
			return this == null ? n : E(this, t, n.bind(this));
		},
		set(e) {
			E(this, t, e);
		}
	});
}
function Ae(e, t) {
	let n = Object.getPrototypeOf(e);
	return t in n ? void 0 : n;
}
var je, D = !1, Me = {
	configurable: !0,
	get() {
		D = !0;
	}
};
function O(e, t, n) {
	let r = Object.getPrototypeOf(e._zod);
	if (t in r && je !== e._zod) {
		je = void 0;
		return;
	}
	je = e._zod, Object.defineProperty(r, t, {
		configurable: !0,
		get() {
			Object.defineProperty(this, t, Me);
			let e = D;
			D = !1;
			try {
				let r = n(this);
				return D ? delete this[t] : Object.defineProperty(this, t, {
					configurable: !0,
					writable: !0,
					value: r
				}), D ||= e, r;
			} catch (n) {
				throw delete this[t], D ||= e, n;
			}
		},
		set(e) {
			Object.defineProperty(this, t, {
				configurable: !0,
				writable: !0,
				value: e
			});
		}
	});
}
function Ne(e, t, n, r) {
	let i = Ae(e, t);
	i && Object.defineProperty(i, t, {
		configurable: !0,
		get() {
			let e = {
				configurable: !0,
				writable: !0,
				enumerable: r,
				value: void 0
			};
			return Object.defineProperty(this, t, e), e.value = n(this), Object.defineProperty(this, t, e), e.value;
		},
		set(e) {
			Object.defineProperty(this, t, {
				configurable: !0,
				writable: !0,
				enumerable: r,
				value: e
			});
		}
	});
}
var Pe = "~constantCatch";
function Fe(e) {
	let t = () => e;
	return t[Pe] = !0, t;
}
//#endregion
//#region node_modules/zod/v4/core/core.js
var Ie, Le = {
	value: void 0,
	enumerable: !1
}, Re = "captureStackTrace" in Error ? Error : null;
function ze(e) {
	let t = Re;
	if (t) {
		let n = t.stackTraceLimit;
		if (typeof n == "number") {
			try {
				t.stackTraceLimit = 0;
			} catch {
				return Re = null, new e();
			}
			try {
				return new e();
			} finally {
				t.stackTraceLimit = n;
			}
		}
	}
	return new e();
}
function k(e, t, n, r) {
	let i = {};
	function a(e) {
		this.def = e, this.constr = d, this.traits = /* @__PURE__ */ new Set();
	}
	a.prototype = i;
	let o = n, s = o && /* @__PURE__ */ new WeakSet();
	function c(n, r) {
		if (!n._zod) {
			Le.value = new a(r);
			try {
				Object.defineProperty(n, "_zod", Le);
			} finally {
				Le.value = void 0;
			}
		} else if (n._zod.traits.has(e)) return;
		if (n._zod.traits.add(e), t(n, r), s) {
			let e = Object.getPrototypeOf(n), t = n._zod.constr.prototype, r = e;
			for (; r && r !== t;) r = Object.getPrototypeOf(r);
			let i = r ?? e;
			s.has(i) || (s.add(i), Ee(i, o));
		}
		let i = d.prototype;
		for (let e in i) Object.prototype.hasOwnProperty.call(i, e) && (e in n || (n[e] = i[e].bind(n)));
	}
	let l = r?.Parent ?? Object;
	class u extends l {}
	Object.defineProperty(u, "name", { value: e });
	function d(e) {
		let t = r?.Parent ? ze(u) : this;
		c(t, e);
		let n = t._zod.deferred;
		if (n) {
			for (let e of n) e();
			t._zod.deferred = void 0;
		}
		let i = globalThis.__zod_globalConfig?.postProcessor;
		return i && i(t), t;
	}
	return Object.defineProperty(d, "init", { value: c }), Object.defineProperty(d, Symbol.hasInstance, { value: (t) => r?.Parent && t instanceof r.Parent ? !0 : t?._zod?.traits?.has(e) }), Object.defineProperty(d, "name", { value: e }), d;
}
var A = class extends Error {
	constructor() {
		super("Encountered Promise during synchronous parse. Use .parseAsync() instead.");
	}
}, Be = class extends Error {
	constructor(e) {
		super(`Encountered unidirectional transform during encode: ${e}`), this.name = "ZodEncodeError";
	}
};
(Ie = globalThis).__zod_globalConfig ?? (Ie.__zod_globalConfig = {});
var j = globalThis.__zod_globalConfig;
function M(e) {
	return e && Object.assign(j, e), j;
}
//#endregion
//#region node_modules/zod/v4/core/errors.js
function Ve() {
	let e = this._zod;
	return e.message ??= JSON.stringify(e.def, r, 2), e.message;
}
function He(e) {
	this._zod.message = e;
}
var Ue = {
	get: Ve,
	set: He,
	enumerable: !0,
	configurable: !0
}, We = {
	value: void 0,
	enumerable: !1
}, Ge = /* @__PURE__ */ new WeakSet([Object.prototype, Error.prototype]), Ke = (e, t) => {
	e.name = "$ZodError", We.value = t, Object.defineProperty(e, "issues", We), We.value = void 0, Object.defineProperty(e, "message", Ue);
	let n = Object.getPrototypeOf(e);
	Ge.has(n) || (Ge.add(n), Object.defineProperty(n, "toString", {
		configurable: !0,
		enumerable: !1,
		get() {
			let e = () => this.message;
			return Object.defineProperty(this, "toString", {
				value: e,
				configurable: !0,
				writable: !0
			}), e;
		},
		set(e) {
			Object.defineProperty(this, "toString", {
				value: e,
				configurable: !0,
				writable: !0
			});
		}
	}));
}, qe = k("$ZodError", Ke);
k("$ZodError", Ke, void 0, { Parent: Error });
function Je(e, t, n) {
	return Object.prototype.hasOwnProperty.call(e, t) || (t === "__proto__" ? Object.defineProperty(e, t, {
		value: n(),
		writable: !0,
		enumerable: !0,
		configurable: !0
	}) : e[t] = n()), e[t];
}
function Ye(e, t = (e) => e.message) {
	let n = {}, r = [];
	for (let i of e.issues) i.path.length > 0 ? Je(n, i.path[0], () => []).push(t(i)) : r.push(t(i));
	return {
		formErrors: r,
		fieldErrors: n
	};
}
function Xe(e, t = (e) => e.message) {
	let n = { _errors: [] }, r = (e, i = []) => {
		for (let a of e.issues) if (a.code === "invalid_union" && a.errors.length) a.errors.map((e) => r({ issues: e }, [...i, ...a.path]));
		else if (a.code === "invalid_key") r({ issues: a.issues }, [...i, ...a.path]);
		else if (a.code === "invalid_element") r({ issues: a.issues }, [...i, ...a.path]);
		else {
			let e = [...i, ...a.path];
			if (e.length === 0) n._errors.push(t(a));
			else {
				let r = n, i = 0;
				for (; i < e.length;) {
					let n = e[i], o = i === e.length - 1;
					if (n === "_errors") {
						o && r._errors.push(t(a)), i++;
						continue;
					}
					Object.prototype.hasOwnProperty.call(r, n) || Object.defineProperty(r, n, {
						value: { _errors: [] },
						enumerable: !0,
						writable: !0,
						configurable: !0
					});
					let s = r[n];
					o && s._errors.push(t(a)), r = s, i++;
				}
			}
		}
	};
	return r(e), n;
}
//#endregion
//#region node_modules/zod/v4/core/parse.js
function Ze(e, t) {
	return {
		callee: t?.callee ?? e,
		Err: t?.Err
	};
}
var Qe = (e) => {
	let t = (n, r, i, a) => {
		let o = i ? {
			...i,
			async: !1
		} : { async: !1 }, s = n._zod.run({
			value: r,
			issues: []
		}, o);
		if (s instanceof Promise) throw new A();
		if (s.issues.length) {
			let n = new ((a?.Err) ?? e)(s.issues.map((e) => w(e, o, M())));
			throw ne(n, a?.callee ?? t), n;
		}
		return s.value;
	};
	return t;
}, $e = (e) => {
	let t = async (n, r, i, a) => {
		let o = i ? {
			...i,
			async: !0
		} : { async: !0 }, s = n._zod.run({
			value: r,
			issues: []
		}, o);
		if (s instanceof Promise && (s = await s), s.issues.length) {
			let n = new ((a?.Err) ?? e)(s.issues.map((e) => w(e, o, M())));
			throw ne(n, a?.callee ?? t), n;
		}
		return s.value;
	};
	return t;
}, et = (e) => (t, n, r) => {
	let i = r ? {
		...r,
		async: !1
	} : { async: !1 }, a = t._zod.run({
		value: n,
		issues: []
	}, i);
	if (a instanceof Promise) throw new A();
	return a.issues.length ? tt(e, a.issues, i) : {
		success: !0,
		data: a.value
	};
};
function tt(e, t, n) {
	let r;
	return {
		success: !1,
		get error() {
			return r || (r = new e(t.map((e) => w(e, n, M()))), t = void 0, n = void 0), r;
		},
		set error(e) {
			r = e, t = void 0, n = void 0;
		}
	};
}
var nt = (e) => async (t, n, r) => {
	let i = r ? {
		...r,
		async: !0
	} : { async: !0 }, a = t._zod.run({
		value: n,
		issues: []
	}, i);
	return a instanceof Promise && (a = await a), a.issues.length ? tt(e, a.issues, i) : {
		success: !0,
		data: a.value
	};
}, rt = /* @__PURE__ */ Symbol.for("zod.compile.invalid"), it = /* @__PURE__ */ Symbol.for("zod.compile.fallback"), at = ((e, t, n) => {
	let r = e._zod.bag.validator;
	if (r !== void 0) {
		if (r(t) !== rt) return !0;
		if (r.definite === !0 && n === void 0) return !1;
	}
	return ot(e, t, n);
});
function ot(e, t, n) {
	let r = n ? {
		...n,
		async: !1,
		abortEarly: !0
	} : {
		async: !1,
		abortEarly: !0
	}, i = e._zod.bag.fallbackRun, a;
	if (i ? (r[it] = !0, a = i({
		value: t,
		issues: []
	}, r)) : a = e._zod.run({
		value: t,
		issues: []
	}, r), a instanceof Promise) throw new A();
	return a.issues.length === 0;
}
var st = async (e, t, n) => {
	let r = n ? {
		...n,
		async: !0,
		abortEarly: !0
	} : {
		async: !0,
		abortEarly: !0
	}, i = e._zod.run({
		value: t,
		issues: []
	}, r);
	return i instanceof Promise && (i = await i), i.issues.length === 0;
}, ct = (e) => {
	let t = Qe(e), n = (e, r, i, a) => {
		let o = i ? {
			...i,
			direction: "backward"
		} : { direction: "backward" };
		return t(e, r, o, Ze(n, a));
	};
	return n;
}, lt = (e) => {
	let t = Qe(e), n = (e, r, i, a) => t(e, r, i, Ze(n, a));
	return n;
}, ut = (e) => {
	let t = $e(e), n = async (e, r, i, a) => {
		let o = i ? {
			...i,
			direction: "backward"
		} : { direction: "backward" };
		return await t(e, r, o, Ze(n, a));
	};
	return n;
}, dt = (e) => {
	let t = $e(e), n = async (e, r, i, a) => await t(e, r, i, Ze(n, a));
	return n;
}, ft = (e) => (t, n, r) => {
	let i = r ? {
		...r,
		direction: "backward"
	} : { direction: "backward" };
	return et(e)(t, n, i);
}, pt = (e) => (t, n, r) => et(e)(t, n, r), mt = (e) => async (t, n, r) => {
	let i = r ? {
		...r,
		direction: "backward"
	} : { direction: "backward" };
	return nt(e)(t, n, i);
}, ht = (e) => async (t, n, r) => nt(e)(t, n, r), gt = /^[cC][0-9a-z]{6,}$/, _t = /^[0-9a-z]+$/, vt = /^[0-7][0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{25}$/, yt = /^[0-9a-vA-V]{20}$/, bt = /^[A-Za-z0-9]{27}$/, xt = /^[a-zA-Z0-9_-]{21}$/;
function St(e) {
	return RegExp(`^[a-zA-Z0-9_-]{${e}}$`);
}
var Ct = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/, wt = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/, Tt = (e) => e ? RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${e}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`) : /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/, Et = /^(?:[A-Za-z0-9_'+\-]+\.)*[A-Za-z0-9_'+\-]*[A-Za-z0-9_+-]@(?:[A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/, Dt = "^(?=[\\s\\S]*[\\p{Extended_Pictographic}\\p{Regional_Indicator}\\u20E3])[\\p{Extended_Pictographic}\\p{Emoji_Component}]+$";
function Ot() {
	return new RegExp(Dt, "u");
}
var kt = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, At = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/, jt = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/, Mt = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, Nt = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/, Pt = /^(?:[A-Za-z0-9_-]{4})*(?:[A-Za-z0-9_-]{2,3})?$/, Ft = /^https?$/, It = /^\+[1-9]\d{6,14}$/, Lt = "(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))";
function Rt(e) {
	return RegExp(`^${e}$`);
}
var zt = /*@__PURE__*/ Rt(Lt);
function Bt(e) {
	let t = "(?:[01]\\d|2[0-3]):[0-5]\\d";
	return typeof e.precision == "number" ? e.precision === -1 ? `${t}` : e.precision === 0 ? `${t}:[0-5]\\d` : `${t}:[0-5]\\d\\.\\d{${e.precision}}` : e.seconds ? `${t}:[0-5]\\d(?:\\.\\d+)?` : `${t}(?::[0-5]\\d(?:\\.\\d+)?)?`;
}
function Vt(e) {
	return RegExp(`^${Bt(e)}$`);
}
function Ht(e) {
	let t = ["Z"];
	e.offset && t.push("([+-](?:[01]\\d|2[0-3]):[0-5]\\d)");
	let n = `${Bt({
		precision: e.precision,
		seconds: !0
	})}(?:${t.join("|")})`, r = e.local ? `${n}|${Bt({ precision: e.precision })}` : n;
	return RegExp(`^${Lt}T(?:${r})$`);
}
var Ut = /^[\s\S]{0,}$/, Wt = /^-?\d+(?:\.\d+)?$/, Gt = /^(?:true|false)$/i, Kt = /^[^A-Z]*$/, qt = /^[^a-z]*$/, N = /*@__PURE__*/ k("$ZodCheck", (e, t) => {
	var n;
	e._zod ??= {}, e._zod.def = t, (n = e._zod).onattach ?? (n.onattach = []);
}), Jt = (e) => {
	let t = e.value;
	return !o(t) && t.length !== void 0;
}, Yt = {
	number: "number",
	bigint: "bigint",
	object: "date"
}, Xt = /*@__PURE__*/ k("$ZodCheckLessThan", (e, t) => {
	N.init(e, t);
	let n = Yt[typeof t.value];
	e._zod.check = (r) => {
		(t.inclusive ? r.value <= t.value : r.value < t.value) || r.issues.push({
			origin: Yt[typeof r.value] ?? n,
			code: "too_big",
			maximum: typeof t.value == "object" ? t.value.getTime() : t.value,
			input: r.value,
			inclusive: t.inclusive,
			inst: e,
			continue: !t.abort
		});
	};
}), Zt = /*@__PURE__*/ k("$ZodCheckGreaterThan", (e, t) => {
	N.init(e, t);
	let n = Yt[typeof t.value];
	e._zod.check = (r) => {
		(t.inclusive ? r.value >= t.value : r.value > t.value) || r.issues.push({
			origin: Yt[typeof r.value] ?? n,
			code: "too_small",
			minimum: typeof t.value == "object" ? t.value.getTime() : t.value,
			input: r.value,
			inclusive: t.inclusive,
			inst: e,
			continue: !t.abort
		});
	};
}), Qt = /*@__PURE__*/ k("$ZodCheckMultipleOf", (e, t) => {
	N.init(e, t), e._zod.check = (n) => {
		if (typeof n.value != typeof t.value) throw Error("Cannot mix number and bigint in multiple_of check.");
		(typeof n.value == "bigint" ? t.value !== BigInt(0) && n.value % t.value === BigInt(0) : c(n.value, t.value) === 0) || n.issues.push({
			origin: typeof n.value,
			code: "not_multiple_of",
			divisor: t.value,
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), $t = /*@__PURE__*/ k("$ZodCheckNumberFormat", (e, t) => {
	N.init(e, t), t.format = t.format || "float64";
	let n = t.format?.includes("int"), r = n ? "int" : "number", [i, a] = ce[t.format];
	e._zod.check = (o) => {
		let s = o.value;
		if (n) {
			if (!Number.isInteger(s)) {
				o.issues.push({
					expected: r,
					format: t.format,
					code: "invalid_type",
					continue: !1,
					input: s,
					inst: e
				});
				return;
			}
			if (!Number.isSafeInteger(s)) {
				s > 0 ? o.issues.push({
					input: s,
					code: "too_big",
					maximum: 2 ** 53 - 1,
					note: "Integers must be within the safe integer range.",
					inst: e,
					origin: r,
					inclusive: !0,
					continue: !t.abort
				}) : o.issues.push({
					input: s,
					code: "too_small",
					minimum: -(2 ** 53 - 1),
					note: "Integers must be within the safe integer range.",
					inst: e,
					origin: r,
					inclusive: !0,
					continue: !t.abort
				});
				return;
			}
		}
		s < i && o.issues.push({
			origin: "number",
			input: s,
			code: "too_small",
			minimum: i,
			inclusive: !0,
			inst: e,
			continue: !t.abort
		}), s > a && o.issues.push({
			origin: "number",
			input: s,
			code: "too_big",
			maximum: a,
			inclusive: !0,
			inst: e,
			continue: !t.abort
		});
	};
}), en = /*@__PURE__*/ k("$ZodCheckMaxLength", (e, t) => {
	var n;
	N.init(e, t), (n = e._zod.def).when ?? (n.when = Jt), e._zod.check = (n) => {
		let r = n.value, i = r.length;
		if ((typeof r == "string" && i > t.maximum ? Ce(r) : i) <= t.maximum) return;
		let a = we(r);
		n.issues.push({
			origin: a,
			code: "too_big",
			maximum: t.maximum,
			inclusive: !0,
			input: r,
			inst: e,
			continue: !t.abort
		});
	};
}), tn = /*@__PURE__*/ k("$ZodCheckMinLength", (e, t) => {
	var n;
	N.init(e, t), (n = e._zod.def).when ?? (n.when = Jt), e._zod.check = (n) => {
		let r = n.value, i = r.length;
		if ((typeof r == "string" && i >= t.minimum && i < t.minimum * 2 ? Ce(r) : i) >= t.minimum) return;
		let a = we(r);
		n.issues.push({
			origin: a,
			code: "too_small",
			minimum: t.minimum,
			inclusive: !0,
			input: r,
			inst: e,
			continue: !t.abort
		});
	};
}), nn = /*@__PURE__*/ k("$ZodCheckLengthEquals", (e, t) => {
	var n;
	N.init(e, t), (n = e._zod.def).when ?? (n.when = Jt), e._zod.check = (n) => {
		let r = n.value, i = r.length, a = typeof r == "string" && i >= t.length && i <= t.length * 2 ? Ce(r) : i;
		if (a === t.length) return;
		let o = we(r), s = a > t.length;
		n.issues.push({
			origin: o,
			...s ? {
				code: "too_big",
				maximum: t.length
			} : {
				code: "too_small",
				minimum: t.length
			},
			inclusive: !0,
			exact: !0,
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), rn = /*@__PURE__*/ k("$ZodCheckStringFormat", (e, t) => {
	var n, r;
	N.init(e, t), t.pattern ? (n = e._zod).check ?? (n.check = (n) => {
		t.pattern.lastIndex = 0, !t.pattern.test(n.value) && n.issues.push({
			origin: "string",
			code: "invalid_format",
			format: t.format,
			input: n.value,
			...t.pattern ? { pattern: t.pattern.toString() } : {},
			inst: e,
			continue: !t.abort
		});
	}) : (r = e._zod).check ?? (r.check = () => {});
}), an = /*@__PURE__*/ k("$ZodCheckRegex", (e, t) => {
	rn.init(e, t), e._zod.check = (n) => {
		t.pattern.lastIndex = 0, !t.pattern.test(n.value) && n.issues.push({
			origin: "string",
			code: "invalid_format",
			format: "regex",
			input: n.value,
			pattern: t.pattern.toString(),
			inst: e,
			continue: !t.abort
		});
	};
}), on = /*@__PURE__*/ k("$ZodCheckLowerCase", (e, t) => {
	t.pattern ??= Kt, rn.init(e, t);
}), sn = /*@__PURE__*/ k("$ZodCheckUpperCase", (e, t) => {
	t.pattern ??= qt, rn.init(e, t);
}), cn = /*@__PURE__*/ k("$ZodCheckIncludes", (e, t) => {
	N.init(e, t);
	let n = y(t.includes);
	t.pattern = new RegExp(typeof t.position == "number" ? `^.{${t.position},}${n}` : n), e._zod.check = (n) => {
		n.value.includes(t.includes, t.position) || n.issues.push({
			origin: "string",
			code: "invalid_format",
			format: "includes",
			includes: t.includes,
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), ln = /*@__PURE__*/ k("$ZodCheckStartsWith", (e, t) => {
	N.init(e, t);
	let n = RegExp(`^${y(t.prefix)}.*`);
	t.pattern ??= n, e._zod.check = (n) => {
		n.value.startsWith(t.prefix) || n.issues.push({
			origin: "string",
			code: "invalid_format",
			format: "starts_with",
			prefix: t.prefix,
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), un = /*@__PURE__*/ k("$ZodCheckEndsWith", (e, t) => {
	N.init(e, t);
	let n = RegExp(`.*${y(t.suffix)}$`);
	t.pattern ??= n, e._zod.check = (n) => {
		n.value.endsWith(t.suffix) || n.issues.push({
			origin: "string",
			code: "invalid_format",
			format: "ends_with",
			suffix: t.suffix,
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), dn = /*@__PURE__*/ k("$ZodCheckOverwrite", (e, t) => {
	N.init(e, t), e._zod.check = (e) => {
		e.value = t.tx(e.value);
	};
}), fn = class {
	constructor(e = [], t = {}) {
		this.content = [], this.indent = 0, this.args = e, this.closed = t;
	}
	indented(e) {
		this.indent += 1;
		try {
			e(this);
		} finally {
			--this.indent;
		}
	}
	write(e) {
		if (typeof e == "function") {
			e(this, { execution: "sync" }), e(this, { execution: "async" });
			return;
		}
		let t = e.split("\n").filter((e) => e), n = Math.min(...t.map((e) => e.length - e.trimStart().length)), r = t.map((e) => e.slice(n)).map((e) => " ".repeat(this.indent * 2) + e);
		for (let e of r) this.content.push(e);
	}
	compile() {
		let e = Function, t = this?.content ?? [""];
		return new e(...Object.keys(this.closed), `return function (${this.args.join(", ")}) {\n${t.join("\n")}\n};`)(...Object.values(this.closed));
	}
}, pn = {
	major: 4,
	minor: 6,
	patch: 5
}, P = /*@__PURE__*/ k("$ZodType", (e, t) => {
	var n;
	e ??= {}, e._zod.def = t, e._zod.bag = e._zod.bag || {}, e._zod.version = pn;
	let r = e._zod.def.checks, i = e._zod.traits.has("$ZodCheck") ? [e, ...r ?? []] : r?.length ? [...r] : [];
	for (let t of i) for (let n of t._zod.onattach) n(e);
	if (i.length === 0) (n = e._zod).deferred ?? (n.deferred = []), e._zod.deferred?.push(() => {
		e._zod.run = e._zod.parse;
	});
	else {
		let t = (t, n, r) => {
			if (t.memo) return t;
			let i = S(t), a;
			for (let o of n) {
				if (o._zod.def.when) {
					if (ye(t) || !o._zod.def.when(t)) continue;
				} else if (i) continue;
				let n = t.issues.length, s = o._zod.check(t);
				if (s instanceof Promise && r?.async === !1) throw new A();
				if (a || s instanceof Promise) a = (a ?? Promise.resolve()).then(async () => {
					await s, t.issues.length !== n && (xe(t.issues, n, e), i ||= S(t, n));
				});
				else {
					if (t.issues.length === n) continue;
					xe(t.issues, n, e), i ||= S(t, n);
				}
			}
			return a ? a.then(() => t) : t;
		}, n = (n, r, a) => {
			if (S(n)) return n.aborted = !0, n;
			let o = t(r, i, a);
			if (o instanceof Promise) {
				if (a.async === !1) throw new A();
				return o.then((t) => e._zod.parse(t, a));
			}
			return e._zod.parse(o, a);
		};
		e._zod.run = (r, a) => {
			if (a.skipChecks) return e._zod.parse(r, a);
			if (a.direction === "backward") {
				let t = e._zod.parse({
					value: r.value,
					issues: []
				}, {
					...a,
					skipChecks: !0
				});
				return t instanceof Promise ? t.then((e) => n(e, r, a)) : n(t, r, a);
			}
			let o = e._zod.parse(r, a);
			if (o instanceof Promise) {
				if (a.async === !1) throw new A();
				return o.then((e) => t(e, i, a));
			}
			return t(o, i, a);
		};
	}
}, {
	get "~standard"() {
		return De(this, "~standard", gn(this));
	},
	set "~standard"(e) {
		E(this, "~standard", e);
	}
}), mn = (e, t) => e.issues.length ? { issues: e.issues.map((e) => w(e, t, M())) } : { value: e.value };
async function hn(e, t) {
	let n = { async: !0 };
	return mn(await e._zod.run({
		value: t,
		issues: []
	}, n), n);
}
function gn(e) {
	return {
		validate: (t) => {
			let n = { async: !1 };
			try {
				let r = e._zod.run({
					value: t,
					issues: []
				}, n);
				if (!(r instanceof Promise)) return mn(r, n);
			} catch {}
			return hn(e, t);
		},
		vendor: "zod",
		version: 1
	};
}
var _n = /*@__PURE__*/ k("$ZodString", (e, t) => {
	P.init(e, t), e._zod.pattern = t.pattern ?? Ut, e._zod.parse = (n, r) => {
		if (t.coerce) try {
			n.value = String(n.value);
		} catch {}
		return typeof n.value == "string" || n.issues.push({
			expected: "string",
			code: "invalid_type",
			input: n.value,
			inst: e
		}), n;
	};
}), F = /*@__PURE__*/ k("$ZodStringFormat", (e, t) => {
	rn.init(e, t), _n.init(e, t);
}), vn = /*@__PURE__*/ k("$ZodGUID", (e, t) => {
	t.pattern ??= wt, F.init(e, t);
}), yn = /*@__PURE__*/ k("$ZodUUID", (e, t) => {
	if (t.version) {
		let e = {
			v1: 1,
			v2: 2,
			v3: 3,
			v4: 4,
			v5: 5,
			v6: 6,
			v7: 7,
			v8: 8
		}[t.version];
		if (e === void 0) throw Error(`Invalid UUID version: "${t.version}"`);
		t.pattern ??= Tt(e);
	} else t.pattern ??= Tt();
	F.init(e, t);
}), bn = /*@__PURE__*/ k("$ZodEmail", (e, t) => {
	t.pattern ??= Et, F.init(e, t);
});
function xn(e) {
	try {
		return typeof URL < "u" && typeof URL.canParse == "function" ? URL.canParse(e) : (new URL(e), !0);
	} catch {
		return !1;
	}
}
function Sn(e, t) {
	return !("normalize" in t) && !("hostname" in t) && !("protocol" in t) ? xn(e) || 2 : Cn(e, t);
}
function Cn(e, t) {
	if (!t.normalize && t.protocol?.source === Ft.source && !/^https?:\/\//i.test(e)) return 1;
	try {
		if (typeof URL < "u") {
			let t = URL;
			if (typeof t.parse == "function") return t.parse(e) ?? 2;
		}
		return new URL(e);
	} catch {
		return 2;
	}
}
var wn = /[\t\n\r]/g;
function Tn(e) {
	return e.replace(wn, "");
}
function En(e, t) {
	return t.lastIndex = 0, t.test(e.hostname);
}
function Dn(e, t) {
	return t.lastIndex = 0, t.test(e.protocol.endsWith(":") ? e.protocol.slice(0, -1) : e.protocol);
}
var On = /*@__PURE__*/ k("$ZodURL", (e, t) => {
	F.init(e, t), e._zod.check = (n) => {
		try {
			let r = n.value.trim(), i = Sn(r, t);
			if (i === 1) {
				n.issues.push({
					code: "invalid_format",
					format: "url",
					note: "Invalid URL format",
					input: n.value,
					inst: e,
					continue: !t.abort
				});
				return;
			}
			if (i === 2) {
				n.issues.push({
					code: "invalid_format",
					format: "url",
					input: n.value,
					inst: e,
					continue: !t.abort
				});
				return;
			}
			if (i === !0) {
				n.value = Tn(r);
				return;
			}
			t.hostname && !En(i, t.hostname) && n.issues.push({
				code: "invalid_format",
				format: "url",
				note: "Invalid hostname",
				pattern: t.hostname.source,
				input: n.value,
				inst: e,
				continue: !t.abort
			}), t.protocol && !Dn(i, t.protocol) && n.issues.push({
				code: "invalid_format",
				format: "url",
				note: "Invalid protocol",
				pattern: t.protocol.source,
				input: n.value,
				inst: e,
				continue: !t.abort
			}), n.value = t.normalize ? i.href : Tn(r);
			return;
		} catch {
			n.issues.push({
				code: "invalid_format",
				format: "url",
				input: n.value,
				inst: e,
				continue: !t.abort
			});
		}
	};
}), kn = /*@__PURE__*/ k("$ZodEmoji", (e, t) => {
	t.pattern ??= Ot(), F.init(e, t);
}), An = /*@__PURE__*/ k("$ZodNanoID", (e, t) => {
	if (t.length !== void 0 && (!Number.isInteger(t.length) || t.length < 1)) throw Error(`Invalid nanoid length: ${t.length}`);
	t.pattern ??= t.length === void 0 ? xt : St(t.length), F.init(e, t);
}), jn = /*@__PURE__*/ k("$ZodCUID", (e, t) => {
	t.pattern ??= gt, F.init(e, t);
}), Mn = /*@__PURE__*/ k("$ZodCUID2", (e, t) => {
	t.pattern ??= _t, F.init(e, t);
}), Nn = /*@__PURE__*/ k("$ZodULID", (e, t) => {
	t.pattern ??= vt, F.init(e, t);
}), Pn = /*@__PURE__*/ k("$ZodXID", (e, t) => {
	t.pattern ??= yt, F.init(e, t);
}), Fn = /*@__PURE__*/ k("$ZodKSUID", (e, t) => {
	t.pattern ??= bt, F.init(e, t);
}), In = /*@__PURE__*/ k("$ZodISODateTime", (e, t) => {
	t.pattern ??= Ht(t), F.init(e, t);
}), Ln = /*@__PURE__*/ k("$ZodISODate", (e, t) => {
	t.pattern ??= zt, F.init(e, t);
}), Rn = /*@__PURE__*/ k("$ZodISOTime", (e, t) => {
	t.pattern ??= Vt(t), F.init(e, t);
}), zn = /*@__PURE__*/ k("$ZodISODuration", (e, t) => {
	t.pattern ??= Ct, F.init(e, t);
}), Bn = /*@__PURE__*/ k("$ZodIPv4", (e, t) => {
	t.pattern ??= kt, F.init(e, t);
}), Vn = /^[0-9a-fA-F:.]+$/;
function Hn(e) {
	return Vn.test(e) ? xn(`http://[${e}]`) : !1;
}
var Un = /*@__PURE__*/ k("$ZodIPv6", (e, t) => {
	t.pattern ??= At, F.init(e, t), e._zod.check = (n) => {
		Hn(n.value) || n.issues.push({
			code: "invalid_format",
			format: "ipv6",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), Wn = /*@__PURE__*/ k("$ZodCIDRv4", (e, t) => {
	t.pattern ??= jt, F.init(e, t);
});
function Gn(e) {
	let t = e.split("/");
	if (t.length !== 2) return !1;
	let [n, r] = t;
	if (!r) return !1;
	let i = Number(r);
	return `${i}` !== r || i < 0 || i > 128 ? !1 : Hn(n);
}
var Kn = /*@__PURE__*/ k("$ZodCIDRv6", (e, t) => {
	t.pattern ??= Mt, F.init(e, t), e._zod.check = (n) => {
		Gn(n.value) || n.issues.push({
			code: "invalid_format",
			format: "cidrv6",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
});
function qn(e) {
	if (e === "") return !0;
	if (/\s/.test(e) || e.length % 4 != 0) return !1;
	try {
		return atob(e), !0;
	} catch {
		return !1;
	}
}
var Jn = /^[0-9a-zA-Z+/]*={0,2}$/, Yn = /*@__PURE__*/ k("$ZodBase64", (e, t) => {
	t.pattern ??= Jn, F.init(e, t), e._zod.check = (n) => {
		qn(n.value) || n.issues.push({
			code: "invalid_format",
			format: "base64",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), Xn = /^[A-Za-z0-9_-]*$/;
function Zn(e) {
	if (!Xn.test(e)) return !1;
	let t = e.replace(/[-_]/g, (e) => e === "-" ? "+" : "/");
	return qn(t.padEnd(Math.ceil(t.length / 4) * 4, "="));
}
var Qn = /*@__PURE__*/ k("$ZodBase64URL", (e, t) => {
	t.pattern ??= Xn, F.init(e, t), e._zod.check = (n) => {
		Zn(n.value) || n.issues.push({
			code: "invalid_format",
			format: "base64url",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), $n = /*@__PURE__*/ k("$ZodE164", (e, t) => {
	t.pattern ??= It, F.init(e, t);
});
function er(e, t = null) {
	try {
		let n = e.split(".");
		if (n.length !== 3) return !1;
		let [r] = n;
		if (!r) return !1;
		let i = JSON.parse(atob(r));
		return !("typ" in i && i?.typ !== "JWT" || !i.alg || t && (!("alg" in i) || i.alg !== t));
	} catch {
		return !1;
	}
}
var tr = /*@__PURE__*/ k("$ZodJWT", (e, t) => {
	F.init(e, t), e._zod.check = (n) => {
		er(n.value, t.alg) || n.issues.push({
			code: "invalid_format",
			format: "jwt",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), nr = /*@__PURE__*/ k("$ZodNumber", (e, t) => {
	P.init(e, t), e._zod.pattern = Wt, e._zod.parse = (n, r) => {
		if (t.coerce) try {
			n.value = Number(n.value);
		} catch {}
		let i = n.value;
		if (typeof i == "number" && !Number.isNaN(i) && Number.isFinite(i)) return n;
		let a = typeof i == "number" ? Number.isNaN(i) ? "NaN" : Number.isFinite(i) ? void 0 : String(i) : void 0;
		return n.issues.push({
			expected: "number",
			code: "invalid_type",
			input: i,
			inst: e,
			...a ? { received: a } : {}
		}), n;
	};
}), rr = /*@__PURE__*/ k("$ZodNumberFormat", (e, t) => {
	$t.init(e, t), nr.init(e, t);
}), ir = /*@__PURE__*/ k("$ZodBoolean", (e, t) => {
	P.init(e, t), e._zod.pattern = Gt, e._zod.parse = (n, r) => {
		if (t.coerce) try {
			n.value = !!n.value;
		} catch {}
		let i = n.value;
		return typeof i == "boolean" || n.issues.push({
			expected: "boolean",
			code: "invalid_type",
			input: i,
			inst: e
		}), n;
	};
}), ar = /*@__PURE__*/ k("$ZodUnknown", (e, t) => {
	P.init(e, t), e._zod.parse = (e) => e;
}), or = /*@__PURE__*/ k("$ZodNever", (e, t) => {
	P.init(e, t), e._zod.parse = (t, n) => (t.issues.push({
		expected: "never",
		code: "invalid_type",
		input: t.value,
		inst: e
	}), t);
});
function sr(e, t, n) {
	e.issues.length && t.issues.push(...be(n, e.issues)), t.value[n] = e.value;
}
var cr = /*@__PURE__*/ k("$ZodArray", (e, t) => {
	P.init(e, t);
	let n = j.memoizer;
	n?.attach(e), e._zod.parse = (r, i) => {
		let a = r.value;
		if (!Array.isArray(a)) return r.issues.push({
			expected: "array",
			code: "invalid_type",
			input: a,
			inst: e
		}), r;
		r.value = n ? n.alloc(e, r, Array(a.length), i) : Array(a.length);
		let o = [], s = i?.abortEarly;
		for (let e = 0; e < a.length; e++) {
			let n = a[e], c = t.element._zod.run({
				value: n,
				issues: []
			}, i);
			if (c instanceof Promise) o.push(c.then((t) => sr(t, r, e)));
			else if (sr(c, r, e), s && c.issues.length !== 0 && S(c)) break;
		}
		return o.length ? Promise.all(o).then(() => r) : r;
	};
});
function lr(e, t, n, r, i, a) {
	let o = n in r, s = a === "optional";
	if (o || !s || i !== "optional") {
		if (e.issues.length) {
			if (i !== void 0 && s && !o) return;
			t.issues.push(...be(n, e.issues));
		}
		if (!o && i === void 0) {
			e.issues.length || t.issues.push({
				code: "invalid_type",
				expected: "nonoptional",
				input: void 0,
				path: [n]
			});
			return;
		}
		e.value === void 0 ? (o || i === "defaulted" && !s) && (t.value[n] = void 0) : t.value[n] = e.value;
	}
}
var ur = [];
function dr(e) {
	let t = Object.keys(e.shape), n = Object.getOwnPropertySymbols(e.shape), r = n.length ? n : ur, i = r.length ? [...t, ...r] : t;
	for (let t of i) if (!e.shape?.[t]?._zod?.traits?.has("$ZodType")) throw Error(`Invalid element at key "${String(t)}": expected a Zod schema`);
	let a = se(e.shape);
	return {
		...e,
		allKeys: i,
		symbolKeys: r,
		keySet: new Set(t),
		numKeys: t.length,
		optionalKeys: new Set(a)
	};
}
function fr(e, t, n, r, i, a, o) {
	let s = [], c = i.keySet, l = i.catchall._zod, u = l.def.type, d = l.optin, f = l.optout, p = 0;
	for (let i in t) {
		if (o && n.issues.length !== p) {
			if (S(n, p)) break;
			p = n.issues.length;
		}
		if (c.has(i)) continue;
		if (i === "__proto__") {
			u === "never" && s.push(i);
			continue;
		}
		if (u === "never") {
			s.push(i);
			continue;
		}
		let a = l.run({
			value: t[i],
			issues: []
		}, r);
		a instanceof Promise ? e.push(a.then((e) => lr(e, n, i, t, d, f))) : lr(a, n, i, t, d, f);
	}
	return s.length && n.issues.push({
		code: "unrecognized_keys",
		keys: s,
		input: t,
		inst: a,
		continue: !0
	}), e.length ? Promise.all(e).then(() => n) : n;
}
var pr = /*@__PURE__*/ k("$ZodObject", (e, t) => {
	P.init(e, t);
	let n = Object.getOwnPropertyDescriptor(t, "shape"), r = n?.get ? n.get.raw : t.shape ?? {};
	if (r) {
		let e = () => {
			let n = { ...r };
			return Object.defineProperty(t, "shape", { value: n }), e.raw = n, n;
		};
		e.raw = r, Object.defineProperty(t, "shape", { get: e });
	}
	let i = a(() => dr(t));
	O(e, "propValues", (e) => {
		let t = e.def.shape, n = {};
		for (let e in t) {
			let r = t[e]._zod;
			if (r.values) {
				Object.prototype.hasOwnProperty.call(n, e) || l(n, e, /* @__PURE__ */ new Set());
				for (let t of r.values) n[e].add(t);
				r.optin !== void 0 && n[e].add(void 0);
			}
		}
		return n;
	});
	let o = _, s = t.catchall, c, u = j.memoizer;
	u?.attach(e), e._zod.parse = (t, n) => {
		c ??= i.value;
		let r = t.value;
		if (!o(r)) return t.issues.push({
			expected: "object",
			code: "invalid_type",
			input: r,
			inst: e
		}), t;
		t.value = u ? u.alloc(e, t, {}, n) : {};
		let a = [], l = c.shape, d = n?.abortEarly, f = t.issues.length;
		for (let e of c.allKeys) {
			if (d && t.issues.length !== f) {
				if (S(t, f)) break;
				f = t.issues.length;
			}
			if (e === "__proto__") continue;
			let i = l[e], o = i._zod.optin, s = i._zod.optout, c = i._zod.run({
				value: r[e],
				issues: []
			}, n);
			c instanceof Promise ? a.push(c.then((n) => lr(n, t, e, r, o, s))) : lr(c, t, e, r, o, s);
		}
		return s ? fr(a, r, t, n, i.value, e, d === !0) : a.length ? Promise.all(a).then(() => t) : t;
	};
}), mr = /*@__PURE__*/ k("$ZodObjectJIT", (e, t) => {
	pr.init(e, t);
	let n = e._zod.parse, r = a(() => dr(t)), i = j.memoizer, o = (t) => {
		let n = r.value, a = n.symbolKeys, o = new fn(["payload", "ctx"], {
			shape: t,
			inst: e,
			memo: i,
			syms: a
		}), s = (e) => `shape[${e}]._zod.run({ value: input[${e}], issues: [] }, ctx)`, c = (e, t) => `
          let ${e}_ab = false;
          for (let i = 0; i < ${e}.issues.length; i++) {
            const iss = ${e}.issues[i];
            iss.path = iss.path ? [${t}, ...iss.path] : [${t}];
            payload.issues.push(iss);
            if (iss.continue !== true) ${e}_ab = true;
          }
          if (${e}_ab && ctx && ctx.abortEarly) {
            payload.value = newResult;
            return payload;
          }`;
		o.write("const input = payload.value;");
		let l = Object.create(null), u = 0;
		for (let e of n.allKeys) l[e] = `key_${u++}`;
		o.write(i ? "const newResult = memo.alloc(inst, payload, {}, ctx);" : "const newResult = {};");
		for (let e of n.allKeys) {
			if (e === "__proto__") continue;
			let n = l[e], r = typeof e == "symbol" ? `syms[${a.indexOf(e)}]` : ee(e), i = `${r} in input`, u = t[e], d = u?._zod?.optin, f = d !== void 0, p = u?._zod?.optout === "optional";
			if (o.write(`const ${n} = ${s(r)};`), f && p) {
				let e = d === "optional" ? `${n}_present` : `${n}.value !== undefined || ${n}_present`;
				o.write(`
        const ${n}_present = ${i};
        if (!${n}.issues.length || ${n}_present) {
          if (${n}.issues.length) {${c(n, r)}
          }

          if (${e}) {
            newResult[${r}] = ${n}.value;
          }
        }

      `);
			} else f ? (o.write(`
        if (${n}.issues.length) {${c(n, r)}
        }
      `), d === "defaulted" ? o.write(`newResult[${r}] = ${n}.value;`) : o.write(`
        if (${n}.value !== undefined || ${i}) {
          newResult[${r}] = ${n}.value;
        }
      `)) : o.write(`
        const ${n}_present = ${i};
        if (${n}.issues.length) {${c(n, r)}
        }
        if (!${n}_present && !${n}.issues.length) {
          payload.issues.push({
            code: "invalid_type",
            expected: "nonoptional",
            input: undefined,
            path: [${r}]
          });
          if (ctx && ctx.abortEarly) {
            payload.value = newResult;
            return payload;
          }
        }

        if (${n}_present) {
          newResult[${r}] = ${n}.value;
        }

      `);
		}
		return o.write("payload.value = newResult;"), o.write("return payload;"), o.compile();
	}, s, c = _, l = !j.jitless, u = l && re.value, d = t.catchall, f;
	e._zod.parse = (i, a) => {
		f ??= r.value;
		let p = i.value;
		return c(p) ? l && u && a?.async === !1 && a.jitless !== !0 ? (s ||= o(t.shape), i = s(i, a), d ? fr([], p, i, a, f, e, a?.abortEarly === !0) : i) : n(i, a) : (i.issues.push({
			expected: "object",
			code: "invalid_type",
			input: p,
			inst: e
		}), i);
	};
});
function hr(e, t, n, r) {
	for (let n of e) if (n.issues.length === 0) return t.value = n.value, t;
	let i = e.filter((e) => !S(e));
	return i.length === 1 ? (t.value = i[0].value, i[0]) : (t.issues.push({
		code: "invalid_union",
		input: t.value,
		inst: n,
		errors: e.map((e) => e.issues.map((e) => w(e, r, M())))
	}), t);
}
var gr = /*@__PURE__*/ k("$ZodUnion", (e, t) => {
	P.init(e, t), O(e, "optin", (e) => e.def.options.some((e) => e._zod.optin === "defaulted") ? "defaulted" : e.def.options.some((e) => e._zod.optin !== void 0) ? "optional" : void 0), O(e, "optout", (e) => e.def.options.some((e) => e._zod.optout === "optional") ? "optional" : void 0), O(e, "values", (e) => {
		if (e.def.options.every((e) => e._zod.values)) return new Set(e.def.options.flatMap((e) => Array.from(e._zod.values)));
	}), O(e, "pattern", (e) => {
		if (e.def.options.every((e) => e._zod.pattern)) {
			let t = e.def.options.map((e) => e._zod.pattern);
			return RegExp(`^(${t.map((e) => s(e.source)).join("|")})$`);
		}
	});
	let n = t.options.length === 1 ? t.options[0]._zod.run : null;
	e._zod.parse = (r, i) => {
		if (n) return n(r, i);
		let a = !1, o = [];
		for (let e of t.options) {
			let t = e._zod.run({
				value: r.value,
				issues: []
			}, i);
			if (t instanceof Promise) o.push(t), a = !0;
			else {
				if (t.issues.length === 0) return t;
				o.push(t);
			}
		}
		return a ? Promise.all(o).then((t) => hr(t, r, e, i)) : hr(o, r, e, i);
	};
});
function _r(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of e.options) {
		let r = n._zod.propValues?.[e.discriminator];
		if (!r || r.size === 0) throw Error(`Invalid discriminated union option at index "${e.options.indexOf(n)}"`);
		for (let e of r) if (t.has(e)) {
			if (e !== void 0) throw Error(`Duplicate discriminator value "${String(e)}"`);
			t.set(e, null);
		} else t.set(e, n);
	}
	return t;
}
var vr = /*@__PURE__*/ k("$ZodDiscriminatedUnion", (e, t) => {
	t.inclusive = !1, gr.init(e, t);
	let n = e._zod.parse;
	O(e, "propValues", (e) => {
		let t = {}, n = 0;
		for (let r of e.def.options) {
			let i = r._zod.propValues;
			if (!i || Object.keys(i).length === 0) throw Error(`Invalid discriminated union option at index "${e.def.options.indexOf(r)}"`);
			i[e.def.discriminator]?.has(void 0) && n++;
			for (let [e, n] of Object.entries(i)) {
				Object.prototype.hasOwnProperty.call(t, e) || l(t, e, /* @__PURE__ */ new Set());
				for (let r of n) t[e].add(r);
			}
		}
		return !e.def.unionFallback && n > 1 && t[e.def.discriminator]?.delete(void 0), t;
	}), t.options.forEach((e, n) => {
		let r = u(e._zod.def);
		if (r && !Object.prototype.hasOwnProperty.call(r, t.discriminator)) throw Error(`Invalid discriminated union option at index "${n}"`);
	});
	let r = a(() => _r(t));
	e._zod.parse = (i, a) => {
		let o = i.value;
		if (!_(o)) return i.issues.push({
			code: "invalid_type",
			expected: "object",
			input: o,
			inst: e
		}), i;
		let s = o?.[t.discriminator], c = r.value.get(s);
		return c && (s !== void 0 || a.direction !== "backward") ? c._zod.run(i, a) : t.unionFallback || a.direction === "backward" ? n(i, a) : (i.issues.push({
			code: "invalid_union",
			errors: [],
			note: "No matching discriminator",
			discriminator: t.discriminator,
			options: Array.from(r.value.keys()).filter((e) => r.value.get(e) !== null),
			input: o,
			path: [t.discriminator],
			inst: e
		}), i);
	};
}), yr = /*@__PURE__*/ k("$ZodIntersection", (e, t) => {
	P.init(e, t), e._zod.parse = (e, n) => {
		let r = e.value, i = t.left._zod.run({
			value: r,
			issues: []
		}, n), a = t.right._zod.run({
			value: r,
			issues: []
		}, n);
		return i instanceof Promise || a instanceof Promise ? Promise.all([i, a]).then(([t, n]) => xr(e, t, n)) : xr(e, i, a);
	};
});
function br(e, t) {
	if (e === t || e instanceof Date && t instanceof Date && +e == +t) return {
		valid: !0,
		data: e
	};
	if (v(e) && v(t)) {
		let n = Object.keys(t), r = Object.keys(e).filter((e) => n.indexOf(e) !== -1), i = {
			...e,
			...t
		};
		Object.prototype.hasOwnProperty.call(i, "__proto__") && delete i.__proto__;
		for (let n of r) {
			if (n === "__proto__") continue;
			let r = br(e[n], t[n]);
			if (!r.valid) return {
				valid: !1,
				mergeErrorPath: [n, ...r.mergeErrorPath]
			};
			i[n] = r.data;
		}
		return {
			valid: !0,
			data: i
		};
	}
	if (Array.isArray(e) && Array.isArray(t)) {
		if (e.length !== t.length) return {
			valid: !1,
			mergeErrorPath: []
		};
		let n = [];
		for (let r = 0; r < e.length; r++) {
			let i = e[r], a = t[r], o = br(i, a);
			if (!o.valid) return {
				valid: !1,
				mergeErrorPath: [r, ...o.mergeErrorPath]
			};
			n.push(o.data);
		}
		return {
			valid: !0,
			data: n
		};
	}
	return {
		valid: !1,
		mergeErrorPath: []
	};
}
function xr(e, t, n) {
	let r = /* @__PURE__ */ new Map(), i, a = /* @__PURE__ */ new Map(), o = (e, t) => {
		let n;
		if (e.code === "unrecognized_keys" && !e.path?.length) i ??= e, n = e.keys;
		else if (e.code === "invalid_key" && e.origin === "record" && e.path?.length === 1) {
			let t = String(e.path[0]);
			a.has(t) || a.set(t, e), n = [t];
		} else return !1;
		for (let e of n) r.has(e) || r.set(e, {}), r.get(e)[t] = !0;
		return !0;
	};
	for (let n of t.issues) o(n, "l") || e.issues.push(n);
	for (let t of n.issues) o(t, "r") || e.issues.push(t);
	let s = [...r].filter(([, e]) => e.l && e.r).map(([e]) => e);
	if (s.length) {
		let t = i ? s.filter((e) => i.keys.includes(e)) : [];
		t.length && e.issues.push({
			...i,
			keys: t
		});
		for (let n of s) !t.includes(n) && a.has(n) && e.issues.push(a.get(n));
	}
	let c = br(t.value, n.value);
	if (!c.valid) {
		if (S(e)) return e;
		throw Error(`Unmergable intersection. Error path: ${JSON.stringify(c.mergeErrorPath)}`);
	}
	return e.value = c.data, e;
}
var Sr = /*@__PURE__*/ k("$ZodEnum", (e, n) => {
	P.init(e, n);
	let r = t(n.entries), i = new Set(r);
	e._zod.values = i, O(e, "pattern", (e) => {
		let n = t(e.def.entries).filter((e) => ae.has(typeof e));
		return RegExp(n.length ? `^(${n.map((e) => y(e.toString())).join("|")})$` : "^[^\\s\\S]$");
	}), e._zod.parse = (t, n) => {
		let a = t.value;
		return i.has(a) || t.issues.push({
			code: "invalid_value",
			values: r,
			input: a,
			inst: e
		}), t;
	};
}), Cr = /*@__PURE__*/ k("$ZodLiteral", (e, t) => {
	P.init(e, t);
	let n = new Set(t.values);
	e._zod.values = n, O(e, "pattern", (e) => {
		let t = e.def.values;
		return RegExp(t.length ? `^(${t.map((e) => typeof e == "string" ? y(e) : e ? y(e.toString()) : String(e)).join("|")})$` : "^[^\\s\\S]$");
	}), e._zod.parse = (r, i) => {
		let a = r.value;
		return n.has(a) || r.issues.push({
			code: "invalid_value",
			values: t.values,
			input: a,
			inst: e
		}), r;
	};
}), wr = /*@__PURE__*/ k("$ZodTransform", (e, t) => {
	P.init(e, t), e._zod.optin = "optional", j.memoizer?.guard(e), e._zod.parse = (n, r) => {
		if (r.direction === "backward") throw new Be(e.constructor.name);
		let i = t.transform(n.value, n);
		if (r.async) return (i instanceof Promise ? i : Promise.resolve(i)).then((e) => (n.value = e, n));
		if (i instanceof Promise) throw new A();
		return n.value = i, n;
	};
});
function Tr(e, t) {
	return e.value = t.issues.length ? void 0 : t.value, e;
}
var Er = /*@__PURE__*/ k("$ZodOptional", (e, t) => {
	P.init(e, t), O(e, "optin", (e) => e.def.innerType._zod.optin === "defaulted" ? "defaulted" : "optional"), e._zod.optout = "optional", O(e, "values", (e) => {
		let t = e.def.innerType._zod.values;
		return t ? /* @__PURE__ */ new Set([...t, void 0]) : void 0;
	}), O(e, "pattern", (e) => {
		let t = e.def.innerType._zod.pattern;
		return t ? RegExp(`^(${s(t.source)})?$`) : void 0;
	}), e._zod.parse = (e, n) => {
		if (e.value === void 0) {
			if (t.innerType._zod.optin !== "defaulted") return e;
			let r = t.innerType._zod.run({
				value: e.value,
				issues: []
			}, n);
			return r instanceof Promise ? r.then((t) => Tr(e, t)) : Tr(e, r);
		}
		return t.innerType._zod.run(e, n);
	};
}), Dr = /*@__PURE__*/ k("$ZodExactOptional", (e, t) => {
	Er.init(e, t), O(e, "values", (e) => e.def.innerType._zod.values), O(e, "pattern", (e) => e.def.innerType._zod.pattern), e._zod.parse = (e, n) => t.innerType._zod.run(e, n);
}), Or = /*@__PURE__*/ k("$ZodNullable", (e, t) => {
	P.init(e, t), O(e, "optin", (e) => e.def.innerType._zod.optin), O(e, "optout", (e) => e.def.innerType._zod.optout), O(e, "pattern", (e) => {
		let t = e.def.innerType._zod.pattern;
		return t ? RegExp(`^(${s(t.source)}|null)$`) : void 0;
	}), O(e, "values", (e) => e.def.innerType._zod.values ? /* @__PURE__ */ new Set([...e.def.innerType._zod.values, null]) : void 0), e._zod.parse = (e, n) => e.value === null ? e : t.innerType._zod.run(e, n);
}), kr = /*@__PURE__*/ k("$ZodDefault", (e, t) => {
	P.init(e, t), e._zod.optin = "defaulted", O(e, "values", (e) => e.def.innerType._zod.values), e._zod.parse = (e, n) => {
		if (n.direction === "backward") return t.innerType._zod.run(e, n);
		if (e.value === void 0) return e.value = t.defaultValue, e;
		let r = t.innerType._zod.run(e, n);
		return r instanceof Promise ? r.then((e) => Ar(e, t)) : Ar(r, t);
	};
});
function Ar(e, t) {
	return e.value === void 0 && (e.value = t.defaultValue), e;
}
var jr = /*@__PURE__*/ k("$ZodPrefault", (e, t) => {
	P.init(e, t), e._zod.optin = "defaulted", O(e, "values", (e) => e.def.innerType._zod.values), e._zod.parse = (e, n) => (n.direction === "backward" || e.value === void 0 && (e.value = t.defaultValue), t.innerType._zod.run(e, n));
}), Mr = /*@__PURE__*/ k("$ZodNonOptional", (e, t) => {
	P.init(e, t), O(e, "values", (e) => {
		let t = e.def.innerType._zod.values;
		return t ? new Set([...t].filter((e) => e !== void 0)) : void 0;
	}), e._zod.parse = (n, r) => {
		let i = t.innerType._zod.run(n, r);
		return i instanceof Promise ? i.then((t) => Nr(t, e)) : Nr(i, e);
	};
});
function Nr(e, t) {
	return !e.issues.length && e.value === void 0 && e.issues.push({
		code: "invalid_type",
		expected: "nonoptional",
		input: e.value,
		inst: t
	}), e;
}
function Pr(e, t, n, r) {
	return t.issues.length ? (e.value = n.catchValue({
		...t,
		value: e.value,
		error: { issues: t.issues.map((e) => w(e, r, M())) },
		input: e.value
	}), e) : (e.value = t.value, t.memo && (e.memo = !0), e);
}
var Fr = /*@__PURE__*/ k("$ZodCatch", (e, t) => {
	P.init(e, t), O(e, "optin", (e) => e.def.innerType._zod.optin === "defaulted" ? "defaulted" : "optional"), O(e, "optout", (e) => e.def.innerType._zod.optout), O(e, "values", (e) => e.def.innerType._zod.values), e._zod.parse = (e, n) => {
		if (n.direction === "backward") return t.innerType._zod.run(e, n);
		let r = t.innerType._zod.run({
			value: e.value,
			issues: []
		}, n);
		return r instanceof Promise ? r.then((r) => Pr(e, r, t, n)) : Pr(e, r, t, n);
	};
}), Ir = /*@__PURE__*/ k("$ZodPipe", (e, t) => {
	P.init(e, t), O(e, "values", (e) => e.def.in._zod.values), O(e, "optin", (e) => e.def.in._zod.optin), O(e, "optout", (e) => e.def.out._zod.optout), O(e, "propValues", (e) => e.def.in._zod.propValues), e._zod.parse = (e, n) => {
		if (n.direction === "backward") {
			let r = t.out._zod.run(e, n);
			return r instanceof Promise ? r.then((e) => Lr(e, t.in, n)) : Lr(r, t.in, n);
		}
		let r = t.in._zod.run(e, n);
		return r instanceof Promise ? r.then((e) => Lr(e, t.out, n)) : Lr(r, t.out, n);
	};
});
function Lr(e, t, n) {
	return e.issues.some((e) => e.code !== "unrecognized_keys") ? (e.aborted = !0, e) : t._zod.run({
		value: e.value,
		issues: e.issues
	}, n);
}
var Rr = /*@__PURE__*/ k("$ZodReadonly", (e, t) => {
	P.init(e, t), O(e, "propValues", (e) => e.def.innerType._zod.propValues), O(e, "values", (e) => e.def.innerType._zod.values), O(e, "optin", (e) => e.def.innerType?._zod?.optin), O(e, "optout", (e) => e.def.innerType?._zod?.optout), e._zod.parse = (e, n) => {
		if (n.direction === "backward") return t.innerType._zod.run(e, n);
		let r = t.innerType._zod.run(e, n);
		return r instanceof Promise ? r.then(zr) : zr(r);
	};
});
function zr(e) {
	return e.memo || (e.value = Object.freeze(e.value)), e;
}
var Br = /*@__PURE__*/ k("$ZodCustom", (e, t) => {
	N.init(e, t), P.init(e, t), e._zod.parse = (e, t) => e, e._zod.check = (n) => {
		let r = n.value, i = t.fn(r);
		if (i instanceof Promise) return i.then((t) => Vr(t, n, r, e));
		Vr(i, n, r, e);
	};
});
function Vr(e, t, n, r) {
	if (!e) {
		let e = {
			code: "custom",
			input: n,
			inst: r,
			path: [...r._zod.def.path ?? []],
			continue: !r._zod.def.abort
		};
		r._zod.def.params && (e.params = r._zod.def.params), t.issues.push(T(e));
	}
}
//#endregion
//#region node_modules/zod/v4/core/memoizer.js
var Hr = class extends Error {
	constructor() {
		super("Cannot parse a reference cycle that closes through a transform"), this.name = "ZodCyclicError";
	}
}, Ur = "~memo", Wr = [];
function Gr(e) {
	return typeof e == "object" && !!e;
}
function Kr(e) {
	return e.map((e) => e.path ? {
		...e,
		path: e.path.slice()
	} : { ...e });
}
var qr = /*@__PURE__*/ new WeakMap(), Jr = 0, Yr = 1, Xr = 2;
function Zr(e, t, n) {
	let r = qr.get(e);
	if (r !== void 0) return r ? Xr : Jr;
	if (t.has(e)) return Xr;
	t.add(e);
	let i = Jr, a = (e) => {
		if (i !== Xr && e?._zod) {
			let r = Zr(e, t, n);
			r > i && (i = r);
		}
	}, o = (e, r) => {
		let i = Jr;
		for (let a of Reflect.ownKeys(e)) {
			let o = Object.getOwnPropertyDescriptor(e, a);
			if (r && !o.enumerable) continue;
			let s = o.get ? Yr : o.value?._zod ? Zr(o.value, t, n) : Jr;
			s > i && (i = s);
		}
		return i;
	}, s = (e) => {
		e > i && (i = e);
	}, c = e._zod.def;
	switch (c.type) {
		case "object": {
			let e = u(c);
			s(e ? o(e, !0) : Yr), a(c.catchall);
			break;
		}
		case "array":
			a(c.element);
			break;
		case "tuple":
			for (let e of c.items) a(e);
			a(c.rest);
			break;
		case "record":
		case "map":
			a(c.keyType), a(c.valueType);
			break;
		case "set":
			a(c.valueType);
			break;
		case "union":
			for (let e of c.options) a(e);
			break;
		case "intersection":
			a(c.left), a(c.right);
			break;
		case "optional":
		case "nullable":
		case "default":
		case "prefault":
		case "catch":
		case "readonly":
		case "nonoptional":
		case "promise":
		case "success":
			a(c.innerType);
			break;
		case "pipe":
			a(c.in), a(c.out);
			break;
		case "function":
			a(c.input), a(c.output);
			break;
		case "lazy": {
			let r = c._cachedInner ?? (n ? e._zod.innerType : void 0);
			s(r ? Zr(r, t, !1) : Yr);
			break;
		}
		case "template_literal":
		case "string":
		case "number":
		case "int":
		case "boolean":
		case "bigint":
		case "symbol":
		case "undefined":
		case "null":
		case "void":
		case "never":
		case "any":
		case "unknown":
		case "date":
		case "nan":
		case "enum":
		case "literal":
		case "file":
		case "transform":
		case "custom": break;
		default: for (let e in c) {
			let t = Object.getOwnPropertyDescriptor(c, e);
			if (!t || t.get) continue;
			let n = t.value;
			if (n && typeof n == "object") {
				if (n._zod) a(n);
				else if (Array.isArray(n)) for (let e of n) a(e);
			}
		}
	}
	return t.delete(e), Qr(e, i);
}
function Qr(e, t) {
	return t !== Yr && qr.set(e, t === Xr), t;
}
function $r(e, t) {
	let n = e.buckets.get(t);
	return n || (n = /* @__PURE__ */ new WeakMap(), e.buckets.set(t, n)), n;
}
var ei, ti = [], ni = {
	alloc(e, t, n) {
		let r = ei;
		if (!r) return n;
		ei = void 0;
		let i = {
			value: n,
			issues: null
		};
		return r.set(t.value, i), ti.push(i), n;
	},
	guard(e) {
		var t;
		(t = e._zod).deferred ?? (t.deferred = []), e._zod.deferred.push(() => {
			let t = e._zod.parse, n = (e, n) => {
				if (n.direction !== "backward" && ii(n, e.value)) throw new Hr();
				return t(e, n);
			};
			e._zod.parse = n, e._zod.run === t && (e._zod.run = n);
		});
	},
	attach(e) {
		var t;
		let n, r = !1, i, a;
		(t = e._zod).deferred ?? (t.deferred = []), e._zod.deferred.push(() => {
			let t = e._zod.parse, o = (s, c) => {
				if (n === void 0) {
					let i = Zr(e, /* @__PURE__ */ new Set(), !1);
					if (i === Jr) return e._zod.parse = t, e._zod.run === o && (e._zod.run = t), t(s, c);
					i === Xr || r ? n = !0 : r = !0;
				}
				let l = s.value;
				if (!Gr(l)) return t(s, c);
				let u = c[Ur];
				u || (u = {
					buckets: /* @__PURE__ */ new WeakMap(),
					backEdges: void 0
				}, c[Ur] = u);
				let d;
				i === c ? d = a : (d = $r(u, e), i = c, a = d);
				let f = d.get(l);
				if (f) return s.value = f.value, f.issues ? f.issues.length && s.issues.push(...Kr(f.issues)) : (s.memo = !0, u.backEdges ?? (u.backEdges = /* @__PURE__ */ new WeakSet()), u.backEdges.add(f.value)), s;
				ei = d;
				let p = ti.length, m = t(s, c);
				ei = void 0;
				let h = ti.length > p ? ti.pop() : void 0;
				return m instanceof Promise ? m.then((e) => (h && (h.issues = e.issues.length ? Kr(e.issues) : Wr), e)) : (h && (h.issues = m.issues.length ? Kr(m.issues) : Wr), m);
			};
			e._zod.parse = o, e._zod.run === t && (e._zod.run = o);
		});
	}
};
function ri() {
	return ni;
}
function ii(e, t) {
	let n = e[Ur]?.backEdges;
	return n !== void 0 && Gr(t) && n.has(t);
}
//#endregion
//#region node_modules/zod/v4/locales/en.js
var ai = () => {
	let e = {
		string: {
			unit: "characters",
			verb: "to have"
		},
		file: {
			unit: "bytes",
			verb: "to have"
		},
		array: {
			unit: "items",
			verb: "to have"
		},
		set: {
			unit: "items",
			verb: "to have"
		},
		map: {
			unit: "entries",
			verb: "to have"
		}
	};
	function t(t) {
		return e[t] ?? null;
	}
	let r = {
		regex: "input",
		email: "email address",
		url: "URL",
		emoji: "emoji",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "ISO datetime",
		date: "ISO date",
		time: "ISO time",
		duration: "ISO duration",
		ipv4: "IPv4 address",
		ipv6: "IPv6 address",
		mac: "MAC address",
		cidrv4: "IPv4 range",
		cidrv6: "IPv6 range",
		base64: "base64-encoded string",
		base64url: "base64url-encoded string",
		json_string: "JSON string",
		e164: "E.164 number",
		currency_code: "currency code",
		credit_card: "credit card number",
		iban: "IBAN",
		jwt: "JWT",
		template_literal: "input"
	}, i = { nan: "NaN" };
	function a(e, t) {
		return e === "number" && typeof t == "number" && !Number.isFinite(t) ? String(t) : i[e] ?? e;
	}
	return (e) => {
		switch (e.code) {
			case "invalid_type": return `Invalid input: expected ${a(e.expected)}, received ${a(Te(e.input), e.input)}`;
			case "invalid_value": return e.values.length === 1 ? `Invalid input: expected ${oe(e.values[0])}` : `Invalid option: expected one of ${n(e.values, "|")}`;
			case "too_big": {
				let n = e.exact ? "exactly " : e.inclusive ? "<=" : "<", r = t(e.origin);
				return r ? `Too big: expected ${e.origin ?? "value"} to have ${n}${e.maximum.toString()} ${r.unit ?? "elements"}` : `Too big: expected ${e.origin ?? "value"} to be ${n}${e.maximum.toString()}`;
			}
			case "too_small": {
				let n = e.exact ? "exactly " : e.inclusive ? ">=" : ">", r = t(e.origin);
				return r ? `Too small: expected ${e.origin} to have ${n}${e.minimum.toString()} ${r.unit}` : `Too small: expected ${e.origin} to be ${n}${e.minimum.toString()}`;
			}
			case "invalid_format": {
				let t = e;
				return t.format === "starts_with" ? `Invalid string: must start with "${t.prefix}"` : t.format === "ends_with" ? `Invalid string: must end with "${t.suffix}"` : t.format === "includes" ? `Invalid string: must include "${t.includes}"` : t.format === "regex" ? `Invalid string: must match pattern ${t.pattern}` : `Invalid ${r[t.format] ?? e.format}`;
			}
			case "not_multiple_of": return `Invalid number: must be a multiple of ${e.divisor}`;
			case "unrecognized_keys": return `Unrecognized key${e.keys.length > 1 ? "s" : ""}: ${n(e.keys, ", ")}`;
			case "invalid_key": return `Invalid key in ${e.origin}`;
			case "invalid_union": return e.options && Array.isArray(e.options) && e.options.length > 0 ? `Invalid discriminator value. Expected ${e.options.map((e) => `'${e}'`).join(" | ")}` : e.inclusive === !1 ? "Invalid input: more than one option matched" : "Invalid input";
			case "invalid_element": return `Invalid value in ${e.origin}`;
			default: return "Invalid input";
		}
	};
};
function oi() {
	return { localeError: ai() };
}
//#endregion
//#region node_modules/zod/v4/core/registries.js
var si, ci = class {
	constructor() {
		this._map = /* @__PURE__ */ new WeakMap(), this._idmap = /* @__PURE__ */ new Map();
	}
	add(e, ...t) {
		let n = t[0];
		return this._map.set(e, n), n && typeof n == "object" && "id" in n && this._idmap.set(n.id, e), this;
	}
	clear() {
		return this._map = /* @__PURE__ */ new WeakMap(), this._idmap = /* @__PURE__ */ new Map(), this;
	}
	remove(e) {
		let t = this._map.get(e);
		return t && typeof t == "object" && "id" in t && this._idmap.delete(t.id), this._map.delete(e), this;
	}
	get(e) {
		let t = e._zod.parent;
		if (t) {
			let n = { ...this.get(t) ?? {} };
			delete n.id;
			let r = {
				...n,
				...this._map.get(e)
			};
			return Object.keys(r).length ? r : void 0;
		}
		return this._map.get(e);
	}
	has(e) {
		return this._map.has(e);
	}
};
function li() {
	return new ci();
}
(si = globalThis).__zod_globalRegistry ?? (si.__zod_globalRegistry = li());
var I = globalThis.__zod_globalRegistry;
//#endregion
//#region node_modules/zod/v4/core/api.js
function ui(e) {
	return e.checks &&= [...e.checks], e;
}
// @__NO_SIDE_EFFECTS__
function di(e, t) {
	return new e(ui({
		type: "string",
		...x(t)
	}));
}
// @__NO_SIDE_EFFECTS__
function fi(e, t) {
	return new e({
		type: "string",
		format: "email",
		check: "string_format",
		abort: !1,
		...x(t)
	});
}
// @__NO_SIDE_EFFECTS__
function pi(e, t) {
	return new e({
		type: "string",
		format: "guid",
		check: "string_format",
		abort: !1,
		...x(t)
	});
}
// @__NO_SIDE_EFFECTS__
function mi(e, t) {
	return new e({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: !1,
		...x(t)
	});
}
// @__NO_SIDE_EFFECTS__
function hi(e, t) {
	return new e({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: !1,
		version: "v4",
		...x(t)
	});
}
// @__NO_SIDE_EFFECTS__
function gi(e, t) {
	return new e({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: !1,
		version: "v6",
		...x(t)
	});
}
// @__NO_SIDE_EFFECTS__
function _i(e, t) {
	return new e({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: !1,
		version: "v7",
		...x(t)
	});
}
// @__NO_SIDE_EFFECTS__
function vi(e, t) {
	return new e({
		type: "string",
		format: "url",
		check: "string_format",
		abort: !1,
		...x(t)
	});
}
// @__NO_SIDE_EFFECTS__
function yi(e, t) {
	return new e({
		type: "string",
		format: "emoji",
		check: "string_format",
		abort: !1,
		...x(t)
	});
}
// @__NO_SIDE_EFFECTS__
function bi(e, t) {
	return new e({
		type: "string",
		format: "nanoid",
		check: "string_format",
		abort: !1,
		...x(t)
	});
}
// @__NO_SIDE_EFFECTS__
function xi(e, t) {
	return new e({
		type: "string",
		format: "cuid",
		check: "string_format",
		abort: !1,
		...x(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Si(e, t) {
	return new e({
		type: "string",
		format: "cuid2",
		check: "string_format",
		abort: !1,
		...x(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Ci(e, t) {
	return new e({
		type: "string",
		format: "ulid",
		check: "string_format",
		abort: !1,
		...x(t)
	});
}
// @__NO_SIDE_EFFECTS__
function wi(e, t) {
	return new e({
		type: "string",
		format: "xid",
		check: "string_format",
		abort: !1,
		...x(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Ti(e, t) {
	return new e({
		type: "string",
		format: "ksuid",
		check: "string_format",
		abort: !1,
		...x(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Ei(e, t) {
	return new e({
		type: "string",
		format: "ipv4",
		check: "string_format",
		abort: !1,
		...x(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Di(e, t) {
	return new e({
		type: "string",
		format: "ipv6",
		check: "string_format",
		abort: !1,
		...x(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Oi(e, t) {
	return new e({
		type: "string",
		format: "cidrv4",
		check: "string_format",
		abort: !1,
		...x(t)
	});
}
// @__NO_SIDE_EFFECTS__
function ki(e, t) {
	return new e({
		type: "string",
		format: "cidrv6",
		check: "string_format",
		abort: !1,
		...x(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Ai(e, t) {
	return new e({
		type: "string",
		format: "base64",
		check: "string_format",
		abort: !1,
		...x(t)
	});
}
// @__NO_SIDE_EFFECTS__
function ji(e, t) {
	return new e({
		type: "string",
		format: "base64url",
		check: "string_format",
		abort: !1,
		...x(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Mi(e, t) {
	return new e({
		type: "string",
		format: "e164",
		check: "string_format",
		abort: !1,
		...x(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Ni(e, t) {
	return new e({
		type: "string",
		format: "jwt",
		check: "string_format",
		abort: !1,
		...x(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Pi(e, t) {
	return new e({
		type: "string",
		format: "datetime",
		check: "string_format",
		offset: !1,
		local: !1,
		precision: null,
		...x(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Fi(e, t) {
	return new e({
		type: "string",
		format: "date",
		check: "string_format",
		...x(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Ii(e, t) {
	return new e({
		type: "string",
		format: "time",
		check: "string_format",
		precision: null,
		...x(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Li(e, t) {
	return new e({
		type: "string",
		format: "duration",
		check: "string_format",
		...x(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Ri(e, t) {
	return new e(ui({
		type: "number",
		checks: [],
		...x(t)
	}));
}
// @__NO_SIDE_EFFECTS__
function zi(e, t) {
	return new e({
		type: "number",
		check: "number_format",
		abort: !1,
		format: "safeint",
		...x(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Bi(e, t) {
	return new e({
		type: "boolean",
		...x(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Vi(e) {
	return new e({ type: "unknown" });
}
// @__NO_SIDE_EFFECTS__
function Hi(e, t) {
	return new e({
		type: "never",
		...x(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Ui(e, t) {
	return new Xt({
		check: "less_than",
		...x(t),
		value: e,
		inclusive: !1
	});
}
// @__NO_SIDE_EFFECTS__
function Wi(e, t) {
	return new Xt({
		check: "less_than",
		...x(t),
		value: e,
		inclusive: !0
	});
}
// @__NO_SIDE_EFFECTS__
function Gi(e, t) {
	return new Zt({
		check: "greater_than",
		...x(t),
		value: e,
		inclusive: !1
	});
}
// @__NO_SIDE_EFFECTS__
function Ki(e, t) {
	return new Zt({
		check: "greater_than",
		...x(t),
		value: e,
		inclusive: !0
	});
}
// @__NO_SIDE_EFFECTS__
function qi(e, t) {
	return new Qt({
		check: "multiple_of",
		...x(t),
		value: e
	});
}
// @__NO_SIDE_EFFECTS__
function Ji(e, t) {
	return new en({
		check: "max_length",
		...x(t),
		maximum: e
	});
}
// @__NO_SIDE_EFFECTS__
function Yi(e, t) {
	return new tn({
		check: "min_length",
		...x(t),
		minimum: e
	});
}
// @__NO_SIDE_EFFECTS__
function Xi(e, t) {
	return new nn({
		check: "length_equals",
		...x(t),
		length: e
	});
}
// @__NO_SIDE_EFFECTS__
function Zi(e, t) {
	return new an({
		check: "string_format",
		format: "regex",
		...x(t),
		pattern: e
	});
}
// @__NO_SIDE_EFFECTS__
function Qi(e) {
	return new on({
		check: "string_format",
		format: "lowercase",
		...x(e)
	});
}
// @__NO_SIDE_EFFECTS__
function $i(e) {
	return new sn({
		check: "string_format",
		format: "uppercase",
		...x(e)
	});
}
// @__NO_SIDE_EFFECTS__
function ea(e, t) {
	return new cn({
		check: "string_format",
		format: "includes",
		...x(t),
		includes: e
	});
}
// @__NO_SIDE_EFFECTS__
function ta(e, t) {
	return new ln({
		check: "string_format",
		format: "starts_with",
		...x(t),
		prefix: e
	});
}
// @__NO_SIDE_EFFECTS__
function na(e, t) {
	return new un({
		check: "string_format",
		format: "ends_with",
		...x(t),
		suffix: e
	});
}
// @__NO_SIDE_EFFECTS__
function L(e) {
	return new dn({
		check: "overwrite",
		tx: e
	});
}
// @__NO_SIDE_EFFECTS__
function ra(e) {
	return /* @__PURE__ */ L((t) => t.normalize(e));
}
// @__NO_SIDE_EFFECTS__
function ia() {
	return /* @__PURE__ */ L((e) => e.trim());
}
// @__NO_SIDE_EFFECTS__
function aa() {
	return /* @__PURE__ */ L((e) => e.toLowerCase());
}
// @__NO_SIDE_EFFECTS__
function oa() {
	return /* @__PURE__ */ L((e) => e.toUpperCase());
}
// @__NO_SIDE_EFFECTS__
function sa() {
	return /* @__PURE__ */ L((e) => te(e));
}
// @__NO_SIDE_EFFECTS__
function ca(e, t, n) {
	return new e({
		type: "array",
		element: t,
		...x(n)
	});
}
// @__NO_SIDE_EFFECTS__
function la(e, t, n) {
	return new e({
		type: "custom",
		check: "custom",
		fn: t,
		...x(n)
	});
}
// @__NO_SIDE_EFFECTS__
function ua(e, t) {
	let n = /* @__PURE__ */ da((t) => (t.addIssue = (e) => {
		if (typeof e == "string") t.issues.push(T(e, t.value, n._zod.def));
		else {
			let r = e;
			r.fatal && (r.continue = !1), r.code ??= "custom", "input" in r || (r.input = t.value), r.inst ??= n, r.continue ??= !n._zod.def.abort, t.issues.push(T(r));
		}
	}, e(t.value, t)), t);
	return n;
}
// @__NO_SIDE_EFFECTS__
function da(e, t) {
	let n = new N({
		check: "custom",
		...x(t)
	});
	return n._zod.check = e, n;
}
//#endregion
//#region node_modules/zod/v4/core/to-json-schema.js
function R(e, ...t) {
	for (let n of t) for (let t of Reflect.ownKeys(n)) Object.prototype.propertyIsEnumerable.call(n, t) && l(e, t, n[t]);
	return e;
}
function fa(e) {
	let t = e?.target ?? "draft-2020-12";
	return t === "draft-4" && (t = "draft-04"), t === "draft-7" && (t = "draft-07"), {
		processors: e.processors ?? {},
		metadataRegistry: e?.metadata ?? I,
		target: t,
		unrepresentable: e?.unrepresentable ?? "throw",
		override: e?.override ?? (() => {}),
		io: e?.io ?? "output",
		counter: 0,
		seen: /* @__PURE__ */ new Map(),
		sharedDefsExtractedFor: void 0,
		sharedEmitDoneFor: void 0,
		cycles: e?.cycles ?? "ref",
		reused: e?.reused ?? "inline",
		intersections: [],
		deferred: [],
		external: e?.external ?? void 0
	};
}
function z(e, t, n, r, i) {
	let a = typeof t.unrepresentable == "function" ? t.unrepresentable({
		zodSchema: e,
		path: r.path,
		message: i
	}) : t.unrepresentable;
	if (a === "any") return !1;
	if (a === void 0 || a === "throw") throw Error(i);
	return Object.assign(n, a), !0;
}
function B(e, t, n = {
	path: [],
	schemaPath: []
}) {
	var r;
	let i = e._zod.def, a = t.seen.get(e);
	if (a) return a.count++, n.schemaPath.includes(e) && (a.cycle = n.path), a.schema;
	let o = {
		schema: {},
		count: 1,
		cycle: void 0,
		path: n.path
	};
	t.seen.set(e, o), t.sharedDefsExtractedFor = void 0, t.sharedEmitDoneFor = void 0;
	let s = e._zod.toJSONSchema?.();
	if (s) o.schema = s;
	else {
		let r = {
			...n,
			schemaPath: [...n.schemaPath, e],
			path: n.path
		};
		if (e._zod.processJSONSchema) e._zod.processJSONSchema(t, o.schema, r);
		else {
			let n = o.schema, a = t.processors[i.type];
			if (!a) throw Error(`[toJSONSchema]: Non-representable type encountered: ${i.type}`);
			a(e, t, n, r);
		}
		let a = e._zod.parent;
		a && (o.ref ||= a, B(a, t, r), t.seen.get(a).isParent = !0);
	}
	let c = t.metadataRegistry.get(e);
	return c && R(o.schema, c), t.io === "input" && V(e) && (delete o.schema.examples, delete o.schema.default), t.io === "input" && "_prefault" in o.schema && ((r = o.schema).default ?? (r.default = o.schema._prefault)), delete o.schema._prefault, t.seen.get(e).schema;
}
function pa(e) {
	return e.replace(/~/g, "~0").replace(/\//g, "~1");
}
function ma(e, t) {
	let n = e.seen.get(t);
	if (!n) throw Error("Unprocessed schema. This is a bug in Zod.");
	if (e.external && e.sharedDefsExtractedFor === e.external) return;
	let r = /* @__PURE__ */ new Map();
	for (let t of e.seen.entries()) {
		let n = e.metadataRegistry.get(t[0])?.id;
		if (n) {
			let e = r.get(n);
			if (e && e !== t[0]) throw Error(`Duplicate schema id "${n}" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.`);
			r.set(n, t[0]);
		}
	}
	let i = (t) => {
		let r = e.target === "draft-2020-12" ? "$defs" : "definitions";
		if (e.external) {
			let n = e.external.registry.get(t[0])?.id, i = e.external.uri ?? ((e) => e);
			if (n) return { ref: i(n) };
			let a = t[1].defId ?? t[1].schema.id ?? `schema${e.counter++}`;
			return t[1].defId = a, {
				defId: a,
				ref: `${i("__shared")}#/${r}/${pa(a)}`
			};
		}
		let i = `#/${r}/`;
		if (t[1] === n && !t[1].schema.id) return { ref: "#" };
		let a = t[1].schema.id ?? `__schema${e.counter++}`;
		return {
			defId: a,
			ref: i + pa(a)
		};
	}, a = (e) => {
		if (e[1].schema.$ref) return;
		let t = e[1], { ref: n, defId: r } = i(e);
		t.def = { ...t.schema }, r && (t.defId = r);
		let a = t.schema;
		for (let e in a) delete a[e];
		a.$ref = n;
	};
	if (e.cycles === "throw") for (let t of e.seen.entries()) {
		let e = t[1];
		if (e.cycle) throw Error(`Cycle detected: #/${e.cycle?.join("/")}/<root>

Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.`);
	}
	for (let n of e.seen.entries()) {
		let r = n[1];
		if (t === n[0]) {
			a(n);
			continue;
		}
		if (e.external) {
			let r = e.external.registry.get(n[0])?.id;
			if (t !== n[0] && r) {
				a(n);
				continue;
			}
		}
		if (e.metadataRegistry.get(n[0])?.id) {
			a(n);
			continue;
		}
		if (r.cycle) {
			a(n);
			continue;
		}
		r.count > 1 && e.reused === "ref" && a(n);
	}
	e.external && (e.sharedDefsExtractedFor = e.external);
}
function ha(e) {
	let t = e.anyOf;
	if (!Array.isArray(t) || t.length === 0 || e.type !== void 0) return;
	let n = [];
	for (let e of t) {
		if (!e || typeof e != "object") return;
		ha(e);
		let t = Object.keys(e);
		if (t.length !== 1 || t[0] !== "type") return;
		let r = e.type;
		for (let e of Array.isArray(r) ? r : [r]) {
			if (typeof e != "string") return;
			n.includes(e) || n.push(e);
		}
	}
	delete e.anyOf, e.type = n.length === 1 ? n[0] : n;
}
var ga = /* @__PURE__ */ new Set([
	"type",
	"properties",
	"required",
	"additionalProperties"
]), _a = ["oneOf", "anyOf"];
function va(e) {
	let t = e.additionalProperties;
	return t === void 0 || t === !1 || typeof t != "object" || !t ? null : Object.keys(t).length ? t : null;
}
function ya(e) {
	let t = [];
	for (let n of e) {
		if (typeof n != "object" || n.type !== "object") return null;
		for (let e in n) if (!ga.has(e)) return null;
		t.push(n);
	}
	let n = {}, r = /* @__PURE__ */ new Set();
	for (let e of t) {
		for (let r in e.properties) {
			if (Object.prototype.hasOwnProperty.call(n, r)) continue;
			let e = [];
			for (let n of t) {
				let t = n.properties?.[r] ?? va(n);
				t != null && (e.some((e) => JSON.stringify(e) === JSON.stringify(t)) || e.push(t));
			}
			l(n, r, e.length === 1 ? e[0] : ya(e) ?? { allOf: e });
		}
		for (let t of e.required ?? []) r.add(t);
	}
	let i = {
		type: "object",
		properties: n
	};
	if (r.size && (i.required = [...r]), t.every((e) => e.additionalProperties === !1)) i.additionalProperties = !1;
	else {
		let e = [];
		for (let n of t) {
			let t = va(n);
			t && !e.some((e) => JSON.stringify(e) === JSON.stringify(t)) && e.push(t);
		}
		e.length === 1 ? i.additionalProperties = e[0] : e.length > 1 && (i.additionalProperties = { allOf: e });
	}
	return i;
}
function ba(e) {
	let t = e.allOf;
	if (!Array.isArray(t) || t.length < 2) return;
	for (let t of ga) if (t in e) return;
	let n = t.filter((e) => _a.some((t) => Array.isArray(e[t]))), r = null;
	if (!n.length) r = ya(t);
	else {
		let e = n[0], i = _a.find((t) => Array.isArray(e[t]));
		if (Object.keys(e).length !== 1) return;
		let a = t.filter((t) => t !== e), o = e[i].map((e) => ya([...a, e]));
		if (o.some((e) => !e)) return;
		r = { [i]: o };
	}
	r && (delete e.allOf, R(e, r));
}
function xa(e, t) {
	let n = e.seen.get(t);
	if (!n) throw Error("Unprocessed schema. This is a bug in Zod.");
	let r = (t) => {
		let n = e.seen.get(t);
		if (n.ref === null) return;
		let i = n.def ?? n.schema, a = { ...i }, o = n.ref;
		if (n.ref = null, o) {
			r(o);
			let n = e.seen.get(o), s = n.schema;
			if (s.$ref && (e.target === "draft-07" || e.target === "draft-04" || e.target === "openapi-3.0") ? (i.allOf = i.allOf ?? [], i.allOf.push(s)) : R(i, s), R(i, a), t._zod.parent === o) for (let e in i) e !== "$ref" && e !== "allOf" && (e in a || delete i[e]);
			if (s.$ref && n.def) for (let e in i) e !== "$ref" && e !== "allOf" && e in n.def && JSON.stringify(i[e]) === JSON.stringify(n.def[e]) && delete i[e];
		}
		let s = t._zod.parent;
		if (s && s !== o) {
			r(s);
			let t = e.seen.get(s);
			if (t?.schema.$ref && (i.$ref = t.schema.$ref, t.def)) for (let e in i) e !== "$ref" && e !== "allOf" && e in t.def && JSON.stringify(i[e]) === JSON.stringify(t.def[e]) && delete i[e];
		}
		e.override({
			zodSchema: t,
			jsonSchema: i,
			path: n.path ?? []
		});
	};
	if (!e.external || e.sharedEmitDoneFor !== e.external) {
		for (let t of [...e.seen.entries()].reverse()) r(t[0]);
		if (e.target !== "openapi-3.0") for (let t of e.seen.entries()) ha(t[1].def ?? t[1].schema);
		for (let t of e.deferred) t();
		if (e.intersections.length) {
			let t = /* @__PURE__ */ new Map();
			for (let n of e.seen.values()) for (let e of [n.schema, n.def]) {
				let n = e?.allOf;
				if (!Array.isArray(n)) continue;
				let r = t.get(n);
				r ? r.push(e) : t.set(n, [e]);
			}
			for (let n of e.intersections) for (let e of t.get(n) ?? []) ba(e);
		}
	}
	let i = {};
	if (e.target === "draft-2020-12" ? i.$schema = "https://json-schema.org/draft/2020-12/schema" : e.target === "draft-07" ? i.$schema = "http://json-schema.org/draft-07/schema#" : e.target === "draft-04" ? i.$schema = "http://json-schema.org/draft-04/schema#" : e.target, e.external?.uri) {
		let n = e.external.registry.get(t)?.id;
		if (!n) throw Error("Schema is missing an `id` property");
		i.$id = e.external.uri(n);
	}
	R(i, n.defId ? n.schema : n.def ?? n.schema);
	let a = e.metadataRegistry.get(t)?.id;
	a !== void 0 && i.id === a && delete i.id;
	let o = e.external?.defs ?? {};
	if (!e.external || e.sharedEmitDoneFor !== e.external) for (let t of e.seen.entries()) {
		let e = t[1];
		e.def && e.defId && (e.def.id === e.defId && delete e.def.id, l(o, e.defId, e.def));
	}
	e.external && (e.sharedEmitDoneFor = e.external), e.external || Object.keys(o).length > 0 && (e.target === "draft-2020-12" ? i.$defs = o : i.definitions = o);
	try {
		let n = JSON.parse(JSON.stringify(i));
		return Object.defineProperty(n, "~standard", {
			value: {
				...t["~standard"],
				jsonSchema: {
					input: Ca(t, "input", e.processors),
					output: Ca(t, "output", e.processors)
				}
			},
			enumerable: !1,
			writable: !1
		}), n;
	} catch {
		throw Error("Error converting schema to JSON.");
	}
}
function V(e, t) {
	let n = t ?? { seen: /* @__PURE__ */ new Set() };
	if (n.seen.has(e)) return !1;
	n.seen.add(e);
	let r = e._zod.def;
	if (r.type === "transform") return !0;
	if (r.type === "array") return V(r.element, n);
	if (r.type === "set") return V(r.valueType, n);
	if (r.type === "lazy") return V(r.getter(), n);
	if (r.type === "promise" || r.type === "optional" || r.type === "nonoptional" || r.type === "nullable" || r.type === "readonly" || r.type === "default" || r.type === "prefault" || r.type === "catch") return V(r.innerType, n);
	if (r.type === "intersection") return V(r.left, n) || V(r.right, n);
	if (r.type === "record" || r.type === "map") return V(r.keyType, n) || V(r.valueType, n);
	if (r.type === "pipe") return e._zod.traits.has("$ZodCodec") ? !0 : V(r.in, n) || V(r.out, n);
	if (r.type === "object") {
		for (let e in r.shape) if (V(r.shape[e], n)) return !0;
		return !1;
	}
	if (r.type === "union") {
		for (let e of r.options) if (V(e, n)) return !0;
		return !1;
	}
	if (r.type === "tuple") {
		for (let e of r.items) if (V(e, n)) return !0;
		return !!(r.rest && V(r.rest, n));
	}
	return !1;
}
var Sa = (e, t = {}) => (n) => {
	let r = fa({
		...n,
		processors: t
	});
	return B(e, r), ma(r, e), xa(r, e);
}, Ca = (e, t, n = {}) => (r) => {
	let { libraryOptions: i, target: a } = r ?? {}, o = fa({
		...i ?? {},
		target: a,
		io: t,
		processors: n
	});
	return B(e, o), ma(o, e), xa(o, e);
}, H = (e, t, n) => {
	(e[t] === void 0 || n > e[t]) && (e[t] = n);
}, U = (e, t, n) => {
	(e[t] === void 0 || n < e[t]) && (e[t] = n);
}, wa = (e, t) => {
	H(e, "minimum", t), U(e, "maximum", t);
}, Ta = (e, t) => {
	e.multipleOf ??= [], e.multipleOf.includes(t) || e.multipleOf.push(t);
}, Ea = (e, t) => {
	e.patterns ??= /* @__PURE__ */ new Set(), e.patterns.add(t);
}, Da = (e, t) => {
	e.mime = e.mime ? e.mime.filter((e) => t.includes(e)) : [...t];
}, Oa = (e, t) => {
	e.format = t, t.includes("int") && (e.isInt = !0);
}, ka = (e, t) => H(e, "minimum", t.minimum), Aa = (e, t) => U(e, "maximum", t.maximum), ja = (e) => (t, n) => {
	Oa(t, n.format);
	let [r, i] = e[n.format];
	H(t, "minimum", r), U(t, "maximum", i);
}, Ma = {
	greater_than: (e, t) => H(e, t.inclusive ? "minimum" : "exclusiveMinimum", t.value),
	less_than: (e, t) => U(e, t.inclusive ? "maximum" : "exclusiveMaximum", t.value),
	multiple_of: (e, t) => Ta(e, t.value),
	number_format: ja(ce),
	bigint_format: ja(le),
	min_length: ka,
	max_length: Aa,
	length_equals: (e, t) => wa(e, t.length),
	min_size: ka,
	max_size: Aa,
	size_equals: (e, t) => wa(e, t.size),
	string_format: (e, t) => {
		Oa(e, t.format), t.pattern && Ea(e, t.pattern), (t.format === "base64" || t.format === "base64url") && (e.contentEncoding = t.format), (t.local || t.precision === -1) && (e.laxFormat = !0);
	},
	mime_type: (e, t) => Da(e, t.mime)
};
function W(e) {
	let t = {}, n = e._zod.def, r = e._zod.traits.has("$ZodCheck") ? [e, ...n.checks ?? []] : n.checks ?? [];
	for (let e of r) Ma[e._zod.def.check]?.(t, e._zod.def);
	let i = e._zod.bag;
	i.minimum !== void 0 && H(t, "minimum", i.minimum), i.exclusiveMinimum !== void 0 && H(t, "exclusiveMinimum", i.exclusiveMinimum), i.maximum !== void 0 && U(t, "maximum", i.maximum), i.exclusiveMaximum !== void 0 && U(t, "exclusiveMaximum", i.exclusiveMaximum), i.multipleOf !== void 0 && Ta(t, i.multipleOf), i.format !== void 0 && (t.format ??= i.format, i.format.includes("int") && (t.isInt = !0)), i.mime && Da(t, i.mime);
	for (let e of i.patterns ?? []) Ea(t, e);
	return t;
}
var Na = {
	guid: "uuid",
	url: "uri",
	datetime: "date-time",
	json_string: "json-string",
	regex: ""
}, Pa = /* @__PURE__ */ new Map([[Jn, Nt], [Xn, Pt]]), Fa = (e) => Pa.get(e) ?? e, Ia = (e, t, n, r) => {
	let i = n;
	i.type = "string";
	let { minimum: a, maximum: o, format: s, patterns: c, contentEncoding: l, laxFormat: u } = W(e);
	if (typeof a == "number" && (i.minLength = a), typeof o == "number" && (i.maxLength = o), s && (i.format = Na[s] ?? s, i.format === "" && delete i.format, (s === "time" || u) && delete i.format), l && (i.contentEncoding = l), c && c.size > 0) {
		let e = [...c].map(Fa);
		e.length === 1 ? i.pattern = e[0].source : e.length > 1 && (i.allOf = [...e.map((e) => ({
			...t.target === "draft-07" || t.target === "draft-04" || t.target === "openapi-3.0" ? { type: "string" } : {},
			pattern: e.source
		}))]);
	}
}, La = (e, t, n, r) => {
	let i = n, { minimum: a, maximum: o, multipleOf: s, exclusiveMaximum: c, exclusiveMinimum: l, isInt: u } = W(e);
	i.type = u ? "integer" : "number";
	let d = typeof l == "number" && l >= (a ?? -Infinity), f = typeof c == "number" && c <= (o ?? Infinity), p = t.target === "draft-04" || t.target === "openapi-3.0";
	if (d ? p ? (i.minimum = l, i.exclusiveMinimum = !0) : i.exclusiveMinimum = l : typeof a == "number" && (i.minimum = a), f ? p ? (i.maximum = c, i.exclusiveMaximum = !0) : i.exclusiveMaximum = c : typeof o == "number" && (i.maximum = o), s) {
		let n = /* @__PURE__ */ new Set();
		for (let a of s) Number.isFinite(a) && a !== 0 ? n.add(Math.abs(a)) : z(e, t, i, r, `A multipleOf divisor of ${a} cannot be represented in JSON Schema`);
		let [a, ...o] = n;
		a !== void 0 && (i.multipleOf = a), o.length && (i.allOf = [...i.allOf ?? [], ...o.map((e) => ({ multipleOf: e }))]);
	}
}, Ra = (e, t, n, r) => {
	n.type = "boolean";
}, za = (e, t, n, r) => {
	n.not = {};
}, Ba = (e, n, r, i) => {
	let a = e._zod.def, o = t(a.entries);
	if (o.length === 0) {
		r.not = {};
		return;
	}
	o.every((e) => typeof e == "number") && (r.type = "number"), o.every((e) => typeof e == "string") && (r.type = "string"), r.enum = o;
}, Va = (e, t, n, r) => {
	let i = e._zod.def;
	if (i.values.length === 0) {
		n.not = {};
		return;
	}
	let a = [];
	for (let o of i.values) if (o === void 0) {
		if (z(e, t, n, r, "Literal `undefined` cannot be represented in JSON Schema")) return;
	} else if (typeof o == "bigint") {
		if (z(e, t, n, r, "BigInt literals cannot be represented in JSON Schema")) return;
		a.push(Number(o));
	} else a.push(o);
	if (a.length !== 0) {
		if (a.length === 1) {
			let e = a[0];
			n.type = e === null ? "null" : typeof e, t.target === "draft-04" || t.target === "openapi-3.0" ? n.enum = [e] : n.const = e;
		} else a.every((e) => typeof e == "number") && (n.type = "number"), a.every((e) => typeof e == "string") && (n.type = "string"), a.every((e) => typeof e == "boolean") && (n.type = "boolean"), a.every((e) => e === null) && (n.type = "null"), n.enum = a;
	}
}, Ha = (e, t, n, r) => {
	z(e, t, n, r, "Custom types cannot be represented in JSON Schema");
}, Ua = (e, t, n, r) => {
	z(e, t, n, r, "Transforms cannot be represented in JSON Schema");
}, Wa = (e, t, n, r) => {
	let i = n, a = e._zod.def, { minimum: o, maximum: s } = W(e);
	typeof o == "number" && (i.minItems = o), typeof s == "number" && (i.maxItems = s), i.type = "array", i.items = B(a.element, t, {
		...r,
		path: [...r.path, "items"]
	});
};
function Ga(e) {
	let t = e._zod.def;
	return t.type === "pipe" && t.in._zod.traits.has("$ZodTransform") ? Ga(t.out) : t.type === "catch" ? Ga(t.innerType) : e._zod.optin;
}
var Ka = (e, t, n, r) => {
	let i = n, a = e._zod.def, o = a.shape;
	if (Object.getOwnPropertySymbols(o).length && z(e, t, i, r, "Symbol keys cannot be represented in JSON Schema")) return;
	i.type = "object", i.properties = {};
	for (let e in o) l(i.properties, e, B(o[e], t, {
		...r,
		path: [
			...r.path,
			"properties",
			e
		]
	}));
	let s = [];
	for (let e of Object.keys(o)) {
		let n = a.shape[e];
		(t.io === "input" ? Ga(n) === void 0 : n._zod.optout === void 0) && s.push(e);
	}
	s.length > 0 && (i.required = s), a.catchall?._zod.def.type === "never" ? i.additionalProperties = !1 : a.catchall ? a.catchall && (i.additionalProperties = B(a.catchall, t, {
		...r,
		path: [...r.path, "additionalProperties"]
	})) : t.io === "output" && (i.additionalProperties = !1);
}, qa = (e, t, n, r) => {
	let i = e._zod.def, a = i.inclusive === !1, o = i.options.map((e, n) => B(e, t, {
		...r,
		path: [
			...r.path,
			a ? "oneOf" : "anyOf",
			n
		]
	}));
	a ? n.oneOf = o : n.anyOf = o;
}, Ja = (e, t, n, r) => {
	let i = e._zod.def, a = B(i.left, t, {
		...r,
		path: [
			...r.path,
			"allOf",
			0
		]
	}), o = B(i.right, t, {
		...r,
		path: [
			...r.path,
			"allOf",
			1
		]
	}), s = (e) => "allOf" in e && Object.keys(e).length === 1, c = [...s(a) ? a.allOf : [a], ...s(o) ? o.allOf : [o]];
	n.allOf = c, t.intersections.push(c);
}, Ya = (e, t, n, r) => {
	let i = e._zod.def, a = B(i.innerType, t, r), o = t.seen.get(e);
	t.target === "openapi-3.0" ? (o.ref = i.innerType, n.nullable = !0) : n.anyOf = [a, { type: "null" }];
}, Xa = (e, t, n, r) => {
	let i = e._zod.def;
	B(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType;
}, Za = Symbol();
function Qa(e, t, n, r, i) {
	let a = !1, o = JSON.stringify(e, (e, t) => typeof t == "bigint" ? (a = !0, null) : t);
	return a ? (z(t, n, r, i, "BigInt defaults cannot be represented in JSON Schema"), Za) : JSON.parse(o);
}
var $a = (e, t, n, r) => {
	let i = e._zod.def;
	B(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType;
	let o = Qa(i.defaultValue, e, t, n, r);
	o !== Za && (n.default = o);
}, eo = (e, t, n, r) => {
	let i = e._zod.def;
	B(i.innerType, t, r);
	let a = t.seen.get(e);
	if (a.ref = i.innerType, t.io !== "input") return;
	let o = Qa(i.defaultValue, e, t, n, r);
	o !== Za && (n._prefault = o);
}, to = (e, t, n, r) => {
	let i = e._zod.def;
	B(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType;
	let o;
	try {
		o = i.catchValue(void 0);
	} catch {
		z(e, t, n, r, "Dynamic catch values are not supported in JSON Schema");
		return;
	}
	n.default = o;
}, no = (e, t, n, r) => {
	let i = e._zod.def, a = i.in._zod.traits.has("$ZodTransform"), o = t.io === "input" ? a ? i.out : i.in : i.out;
	B(o, t, r);
	let s = t.seen.get(e);
	s.ref = o;
}, ro = (e, t, n, r) => {
	let i = e._zod.def;
	B(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType, n.readOnly = !0;
}, io = (e, t, n, r) => {
	let i = e._zod.def;
	B(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType;
}, ao = /* @__PURE__ */ new WeakSet([Object.prototype, Error.prototype]);
function oo(e, t, n) {
	Object.defineProperty(e, t, {
		configurable: !0,
		enumerable: !1,
		get() {
			let e = n(this);
			return Object.defineProperty(this, t, {
				value: e,
				configurable: !0,
				writable: !0
			}), e;
		},
		set(e) {
			Object.defineProperty(this, t, {
				value: e,
				configurable: !0,
				writable: !0
			});
		}
	});
}
var G = /*@__PURE__*/ k("ZodError", (e, t) => {
	qe.init(e, t), e.name = "ZodError";
	let n = Object.getPrototypeOf(e);
	ao.has(n) || (ao.add(n), oo(n, "format", (e) => (t) => Xe(e, t)), oo(n, "flatten", (e) => (t) => Ye(e, t)), oo(n, "addIssue", (e) => (t) => {
		e.issues.push(t), e.message = JSON.stringify(e.issues, r, 2);
	}), oo(n, "addIssues", (e) => (t) => {
		e.issues.push(...t), e.message = JSON.stringify(e.issues, r, 2);
	}), Object.defineProperty(n, "isEmpty", {
		configurable: !0,
		enumerable: !1,
		get() {
			return this.issues.length === 0;
		}
	}));
}, void 0, { Parent: Error }), so = /* @__PURE__ */ Qe(G), co = /* @__PURE__ */ $e(G), lo = /* @__PURE__ */ et(G), uo = /* @__PURE__ */ nt(G), fo = /* @__PURE__ */ ct(G), po = /* @__PURE__ */ lt(G), mo = /* @__PURE__ */ ut(G), ho = /* @__PURE__ */ dt(G), go = /* @__PURE__ */ ft(G), _o = /* @__PURE__ */ pt(G), vo = /* @__PURE__ */ mt(G), yo = /* @__PURE__ */ ht(G);
//#endregion
//#region node_modules/zod/v4/classic/schemas.js
function bo() {
	j.localeError || M(oi());
}
function xo() {
	j.memoizer || M({ memoizer: ri() });
}
var K = /*@__PURE__*/ k("ZodType", (e, t) => (bo(), P.init(e, t), e.def = t, e.type = t.type, e), {
	check(...e) {
		let t = this.def;
		return this.clone(g(t, { checks: [...t.checks ?? [], ...e.map((e) => typeof e == "function" ? { _zod: {
			check: e,
			def: { check: "custom" },
			onattach: []
		} } : e)] }), { parent: !0 });
	},
	with(...e) {
		return this.check(...e);
	},
	clone(e, t) {
		return b(this, e, t);
	},
	brand() {
		return this;
	},
	register(e, t) {
		return e.add(this, t), this;
	},
	refine(e, t) {
		return this.check(Fs(e, t));
	},
	superRefine(e, t) {
		return this.check(Is(e, t));
	},
	overwrite(e) {
		return this.check(/* @__PURE__ */ L(e));
	},
	optional() {
		return _s(this);
	},
	exactOptional() {
		return ys(this);
	},
	nullable() {
		return xs(this);
	},
	nullish() {
		return _s(xs(this));
	},
	nonoptional(e) {
		return Ds(this, e);
	},
	array() {
		return rs(this);
	},
	or(e) {
		return os([this, e]);
	},
	and(e) {
		return us(this, e);
	},
	transform(e) {
		return js(this, hs(e));
	},
	default(e) {
		return Cs(this, e);
	},
	prefault(e) {
		return Ts(this, e);
	},
	catch(e) {
		return ks(this, e);
	},
	pipe(e) {
		return js(this, e);
	},
	readonly() {
		return Ns(this);
	},
	describe(e) {
		let t = this.clone();
		return I.add(t, { description: e }), t;
	},
	meta(...e) {
		if (e.length === 0) return I.get(this);
		let t = this.clone();
		return I.add(t, e[0]), t;
	},
	isOptional() {
		return this.safeParse(void 0).success;
	},
	isNullable() {
		return this.safeParse(null).success;
	},
	apply(e, ...t) {
		return t.length === 0 ? e(this) : e(this, ...t);
	},
	get "~standard"() {
		return De(this, "~standard", {
			...gn(this),
			jsonSchema: {
				input: Ca(this, "input"),
				output: Ca(this, "output")
			}
		});
	},
	set "~standard"(e) {
		E(this, "~standard", e);
	},
	parse: function e(t, n) {
		return so(this, t, n, { callee: e });
	},
	parseAsync: async function e(t, n) {
		return await co(this, t, n, { callee: e });
	},
	safeParse(e, t) {
		return lo(this, e, t);
	},
	async safeParseAsync(e, t) {
		return uo(this, e, t);
	},
	get spa() {
		return this?.safeParseAsync;
	},
	set spa(e) {
		E(this, "spa", e);
	},
	validate(e, t) {
		return at(this, e, t);
	},
	validateAsync(e, t) {
		return st(this, e, t);
	},
	encode: function e(t, n) {
		return fo(this, t, n, { callee: e });
	},
	decode: function e(t, n) {
		return po(this, t, n, { callee: e });
	},
	encodeAsync: async function e(t, n) {
		return await mo(this, t, n, { callee: e });
	},
	decodeAsync: async function e(t, n) {
		return await ho(this, t, n, { callee: e });
	},
	safeEncode(e, t) {
		return go(this, e, t);
	},
	safeDecode(e, t) {
		return _o(this, e, t);
	},
	async safeEncodeAsync(e, t) {
		return vo(this, e, t);
	},
	async safeDecodeAsync(e, t) {
		return yo(this, e, t);
	},
	toJSONSchema(e) {
		return Sa(this, {})(e);
	},
	get description() {
		return I.get(this)?.description;
	},
	get _def() {
		return this._zod.def;
	}
}), So = /*@__PURE__*/ k("_ZodString", (e, t) => {
	_n.init(e, t), K.init(e, t), e._zod.processJSONSchema = (t, n, r) => Ia(e, t, n, r);
}, /*@__PURE__*/ Oe({
	format: (e) => W(e).format ?? null,
	minLength: (e) => W(e).minimum ?? null,
	maxLength: (e) => W(e).maximum ?? null
}, {
	regex(...e) {
		return this.check(/* @__PURE__ */ Zi(...e));
	},
	includes(...e) {
		return this.check(/* @__PURE__ */ ea(...e));
	},
	startsWith(...e) {
		return this.check(/* @__PURE__ */ ta(...e));
	},
	endsWith(...e) {
		return this.check(/* @__PURE__ */ na(...e));
	},
	min(...e) {
		return this.check(/* @__PURE__ */ Yi(...e));
	},
	max(...e) {
		return this.check(/* @__PURE__ */ Ji(...e));
	},
	length(...e) {
		return this.check(/* @__PURE__ */ Xi(...e));
	},
	nonempty(...e) {
		return this.check(/* @__PURE__ */ Yi(1, ...e));
	},
	lowercase(e) {
		return this.check(/* @__PURE__ */ Qi(e));
	},
	uppercase(e) {
		return this.check(/* @__PURE__ */ $i(e));
	},
	trim() {
		return this.check(/* @__PURE__ */ ia());
	},
	normalize(...e) {
		return this.check(/* @__PURE__ */ ra(...e));
	},
	toLowerCase() {
		return this.check(/* @__PURE__ */ aa());
	},
	toUpperCase() {
		return this.check(/* @__PURE__ */ oa());
	},
	slugify() {
		return this.check(/* @__PURE__ */ sa());
	}
})), Co = /*@__PURE__*/ k("ZodString", (e, t) => {
	_n.init(e, t), So.init(e, t);
}, {
	email(e) {
		return this.check(/* @__PURE__ */ fi(Oo, e));
	},
	url(e) {
		return this.check(/* @__PURE__ */ vi(jo, e));
	},
	jwt(e) {
		return this.check(/* @__PURE__ */ Ni(Ko, e));
	},
	emoji(e) {
		return this.check(/* @__PURE__ */ yi(Mo, e));
	},
	guid(e) {
		return this.check(/* @__PURE__ */ pi(ko, e));
	},
	uuid(e) {
		return this.check(/* @__PURE__ */ mi(Ao, e));
	},
	uuidv4(e) {
		return this.check(/* @__PURE__ */ hi(Ao, e));
	},
	uuidv6(e) {
		return this.check(/* @__PURE__ */ gi(Ao, e));
	},
	uuidv7(e) {
		return this.check(/* @__PURE__ */ _i(Ao, e));
	},
	nanoid(e) {
		return this.check(/* @__PURE__ */ bi(No, e));
	},
	cuid(e) {
		return this.check(/* @__PURE__ */ xi(Po, e));
	},
	cuid2(e) {
		return this.check(/* @__PURE__ */ Si(Fo, e));
	},
	ulid(e) {
		return this.check(/* @__PURE__ */ Ci(Io, e));
	},
	base64(e) {
		return this.check(/* @__PURE__ */ Ai(Uo, e));
	},
	base64url(e) {
		return this.check(/* @__PURE__ */ ji(Wo, e));
	},
	xid(e) {
		return this.check(/* @__PURE__ */ wi(Lo, e));
	},
	ksuid(e) {
		return this.check(/* @__PURE__ */ Ti(Ro, e));
	},
	ipv4(e) {
		return this.check(/* @__PURE__ */ Ei(zo, e));
	},
	ipv6(e) {
		return this.check(/* @__PURE__ */ Di(Bo, e));
	},
	cidrv4(e) {
		return this.check(/* @__PURE__ */ Oi(Vo, e));
	},
	cidrv6(e) {
		return this.check(/* @__PURE__ */ ki(Ho, e));
	},
	e164(e) {
		return this.check(/* @__PURE__ */ Mi(Go, e));
	},
	datetime(e) {
		return this.check(/* @__PURE__ */ Pi(wo, e));
	},
	date(e) {
		return this.check(/* @__PURE__ */ Fi(To, e));
	},
	time(e) {
		return this.check(/* @__PURE__ */ Ii(Eo, e));
	},
	duration(e) {
		return this.check(/* @__PURE__ */ Li(Do, e));
	}
});
function q(e) {
	return /* @__PURE__ */ di(Co, e);
}
var J = /*@__PURE__*/ k("ZodStringFormat", (e, t) => {
	F.init(e, t), So.init(e, t);
}), wo = /*@__PURE__*/ k("ZodISODateTime", (e, t) => {
	In.init(e, t), J.init(e, t);
}), To = /*@__PURE__*/ k("ZodISODate", (e, t) => {
	Ln.init(e, t), J.init(e, t);
}), Eo = /*@__PURE__*/ k("ZodISOTime", (e, t) => {
	Rn.init(e, t), J.init(e, t);
}), Do = /*@__PURE__*/ k("ZodISODuration", (e, t) => {
	zn.init(e, t), J.init(e, t);
}), Oo = /*@__PURE__*/ k("ZodEmail", (e, t) => {
	bn.init(e, t), J.init(e, t);
}), ko = /*@__PURE__*/ k("ZodGUID", (e, t) => {
	vn.init(e, t), J.init(e, t);
}), Ao = /*@__PURE__*/ k("ZodUUID", (e, t) => {
	yn.init(e, t), J.init(e, t);
}), jo = /*@__PURE__*/ k("ZodURL", (e, t) => {
	On.init(e, t), J.init(e, t);
}), Mo = /*@__PURE__*/ k("ZodEmoji", (e, t) => {
	kn.init(e, t), J.init(e, t);
}), No = /*@__PURE__*/ k("ZodNanoID", (e, t) => {
	An.init(e, t), J.init(e, t);
}), Po = /*@__PURE__*/ k("ZodCUID", (e, t) => {
	jn.init(e, t), J.init(e, t);
}), Fo = /*@__PURE__*/ k("ZodCUID2", (e, t) => {
	Mn.init(e, t), J.init(e, t);
}), Io = /*@__PURE__*/ k("ZodULID", (e, t) => {
	Nn.init(e, t), J.init(e, t);
}), Lo = /*@__PURE__*/ k("ZodXID", (e, t) => {
	Pn.init(e, t), J.init(e, t);
}), Ro = /*@__PURE__*/ k("ZodKSUID", (e, t) => {
	Fn.init(e, t), J.init(e, t);
}), zo = /*@__PURE__*/ k("ZodIPv4", (e, t) => {
	Bn.init(e, t), J.init(e, t);
}), Bo = /*@__PURE__*/ k("ZodIPv6", (e, t) => {
	Un.init(e, t), J.init(e, t);
}), Vo = /*@__PURE__*/ k("ZodCIDRv4", (e, t) => {
	Wn.init(e, t), J.init(e, t);
}), Ho = /*@__PURE__*/ k("ZodCIDRv6", (e, t) => {
	Kn.init(e, t), J.init(e, t);
}), Uo = /*@__PURE__*/ k("ZodBase64", (e, t) => {
	Yn.init(e, t), J.init(e, t);
}), Wo = /*@__PURE__*/ k("ZodBase64URL", (e, t) => {
	Qn.init(e, t), J.init(e, t);
}), Go = /*@__PURE__*/ k("ZodE164", (e, t) => {
	$n.init(e, t), J.init(e, t);
}), Ko = /*@__PURE__*/ k("ZodJWT", (e, t) => {
	tr.init(e, t), J.init(e, t);
}), qo = /*@__PURE__*/ k("ZodNumber", (e, t) => {
	nr.init(e, t), K.init(e, t), e._zod.processJSONSchema = (t, n, r) => La(e, t, n, r), e.isFinite = !0;
}, /*@__PURE__*/ Oe({
	minValue: (e) => {
		let { minimum: t, exclusiveMinimum: n } = W(e);
		return Math.max(t ?? -Infinity, n ?? -Infinity);
	},
	maxValue: (e) => {
		let { maximum: t, exclusiveMaximum: n } = W(e);
		return Math.min(t ?? Infinity, n ?? Infinity);
	},
	isInt: (e) => {
		let { isInt: t, multipleOf: n } = W(e);
		return !!t || !!n?.some(Number.isSafeInteger);
	},
	format: (e) => W(e).format ?? null
}, {
	gt(e, t) {
		return this.check(/* @__PURE__ */ Gi(e, t));
	},
	gte(e, t) {
		return this.check(/* @__PURE__ */ Ki(e, t));
	},
	min(e, t) {
		return this.check(/* @__PURE__ */ Ki(e, t));
	},
	lt(e, t) {
		return this.check(/* @__PURE__ */ Ui(e, t));
	},
	lte(e, t) {
		return this.check(/* @__PURE__ */ Wi(e, t));
	},
	max(e, t) {
		return this.check(/* @__PURE__ */ Wi(e, t));
	},
	int(e) {
		return this.check(Yo(e));
	},
	safe(e) {
		return this.check(Yo(e));
	},
	positive(e) {
		return this.check(/* @__PURE__ */ Gi(0, e));
	},
	nonnegative(e) {
		return this.check(/* @__PURE__ */ Ki(0, e));
	},
	negative(e) {
		return this.check(/* @__PURE__ */ Ui(0, e));
	},
	nonpositive(e) {
		return this.check(/* @__PURE__ */ Wi(0, e));
	},
	multipleOf(e, t) {
		return this.check(/* @__PURE__ */ qi(e, t));
	},
	step(e, t) {
		return this.check(/* @__PURE__ */ qi(e, t));
	},
	finite() {
		return this;
	}
}));
function Y(e) {
	return /* @__PURE__ */ Ri(qo, e);
}
var Jo = /*@__PURE__*/ k("ZodNumberFormat", (e, t) => {
	rr.init(e, t), qo.init(e, t);
});
function Yo(e) {
	return /* @__PURE__ */ zi(Jo, e);
}
var Xo = /*@__PURE__*/ k("ZodBoolean", (e, t) => {
	ir.init(e, t), K.init(e, t), e._zod.processJSONSchema = (t, n, r) => Ra(e, t, n, r);
});
function Zo(e) {
	return /* @__PURE__ */ Bi(Xo, e);
}
var Qo = /*@__PURE__*/ k("ZodUnknown", (e, t) => {
	ar.init(e, t), K.init(e, t), e._zod.processJSONSchema = (e, t, n) => void 0;
});
function $o() {
	return /* @__PURE__ */ Vi(Qo);
}
var es = /*@__PURE__*/ k("ZodNever", (e, t) => {
	or.init(e, t), K.init(e, t), e._zod.processJSONSchema = (t, n, r) => za(e, t, n, r);
});
function ts(e) {
	return /* @__PURE__ */ Hi(es, e);
}
var ns = /*@__PURE__*/ k("ZodArray", (e, t) => {
	xo(), cr.init(e, t), K.init(e, t), e._zod.processJSONSchema = (t, n, r) => Wa(e, t, n, r), e.element = t.element;
}, {
	min(e, t) {
		return this.check(/* @__PURE__ */ Yi(e, t));
	},
	nonempty(e) {
		return this.check(/* @__PURE__ */ Yi(1, e));
	},
	max(e, t) {
		return this.check(/* @__PURE__ */ Ji(e, t));
	},
	length(e, t) {
		return this.check(/* @__PURE__ */ Xi(e, t));
	},
	unwrap() {
		return this.element;
	}
});
function rs(e, t) {
	return /* @__PURE__ */ ca(ns, e, t);
}
var is = /*@__PURE__*/ k("ZodObject", (e, t) => {
	xo(), mr.init(e, t), K.init(e, t), e._zod.processJSONSchema = (t, n, r) => Ka(e, t, n, r), Ne(e, "shape", (e) => e._zod.def.shape, !1);
}, {
	keyof() {
		return Z(Object.keys(this._zod.def.shape));
	},
	catchall(e) {
		return this.clone(g(this._zod.def, { catchall: e }));
	},
	passthrough() {
		return this.clone(g(this._zod.def, { catchall: $o() }));
	},
	loose() {
		return this.clone(g(this._zod.def, { catchall: $o() }));
	},
	strict() {
		return this.clone(g(this._zod.def, { catchall: ts() }));
	},
	strip() {
		return this.clone(g(this._zod.def, { catchall: void 0 }));
	},
	extend(e) {
		return pe(this, e);
	},
	safeExtend(e) {
		return he(this, e);
	},
	merge(e) {
		return ge(this, e);
	},
	pick(e) {
		return ue(this, e);
	},
	omit(e) {
		return fe(this, e);
	},
	partial(...e) {
		return _e(gs, this, e[0]);
	},
	exactPartial(...e) {
		return _e(vs, this, e[0], "exactPartial");
	},
	required(...e) {
		return ve(Es, this, e[0]);
	}
});
function X(e, t) {
	return new is({
		type: "object",
		shape: e ?? {},
		...x(t)
	});
}
var as = /*@__PURE__*/ k("ZodUnion", (e, t) => {
	gr.init(e, t), K.init(e, t), e._zod.processJSONSchema = (t, n, r) => qa(e, t, n, r), e.options = t.options;
});
function os(e, t) {
	return new as({
		type: "union",
		options: e,
		...x(t)
	});
}
var ss = /*@__PURE__*/ k("ZodDiscriminatedUnion", (e, t) => {
	as.init(e, t), vr.init(e, t);
});
function cs(e, t, n) {
	return new ss({
		type: "union",
		options: t,
		discriminator: e,
		...x(n)
	});
}
var ls = /*@__PURE__*/ k("ZodIntersection", (e, t) => {
	yr.init(e, t), K.init(e, t), e._zod.processJSONSchema = (t, n, r) => Ja(e, t, n, r);
});
function us(e, t) {
	return new ls({
		type: "intersection",
		left: e,
		right: t
	});
}
var ds = /*@__PURE__*/ k("ZodEnum", (e, t) => {
	Sr.init(e, t), K.init(e, t), e._zod.processJSONSchema = (t, n, r) => Ba(e, t, n, r), e.enum = t.entries, e.options = [...e._zod.values];
	let n = new Set(Object.keys(t.entries));
	e.extract = (e, r) => {
		let i = {};
		for (let r of e) if (n.has(r)) i[r] = t.entries[r];
		else throw Error(`Key ${r} not found in enum`);
		return new ds({
			...t,
			checks: [],
			...x(r),
			entries: i
		});
	}, e.exclude = (e, r) => {
		let i = { ...t.entries };
		for (let t of e) if (n.has(t)) delete i[t];
		else throw Error(`Key ${t} not found in enum`);
		return new ds({
			...t,
			checks: [],
			...x(r),
			entries: i
		});
	};
});
function Z(e, t) {
	return new ds({
		type: "enum",
		entries: Array.isArray(e) ? Object.fromEntries(e.map((e) => [e, e])) : e,
		...x(t)
	});
}
var fs = /*@__PURE__*/ k("ZodLiteral", (e, t) => {
	Cr.init(e, t), K.init(e, t), e._zod.processJSONSchema = (t, n, r) => Va(e, t, n, r), e.values = new Set(t.values), Object.defineProperty(e, "value", { get() {
		if (t.values.length > 1) throw Error("This schema contains multiple valid literal values. Use `.values` instead.");
		return t.values[0];
	} });
});
function ps(e, t) {
	return new fs({
		type: "literal",
		values: Array.isArray(e) ? e : [e],
		...x(t)
	});
}
var ms = /*@__PURE__*/ k("ZodTransform", (e, t) => {
	xo(), wr.init(e, t), K.init(e, t), e._zod.processJSONSchema = (t, n, r) => Ua(e, t, n, r), e._zod.parse = (n, r) => {
		if (r.direction === "backward") throw new Be(e.constructor.name);
		n.addIssue = (r) => {
			if (typeof r == "string") n.issues.push(T(r, n.value, t));
			else {
				let t = r;
				t.fatal && (t.continue = !1), t.code ??= "custom", "input" in t || (t.input = n.value), t.inst ??= e, n.issues.push(T(t));
			}
		};
		let i = t.transform(n.value, n);
		return i instanceof Promise ? i.then((e) => (n.value = e, n)) : (n.value = i, n);
	};
});
function hs(e) {
	return new ms({
		type: "transform",
		transform: e
	});
}
var gs = /*@__PURE__*/ k("ZodOptional", (e, t) => {
	Er.init(e, t), K.init(e, t), e._zod.processJSONSchema = (t, n, r) => io(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function _s(e) {
	return new gs({
		type: "optional",
		innerType: e
	});
}
var vs = /*@__PURE__*/ k("ZodExactOptional", (e, t) => {
	Dr.init(e, t), K.init(e, t), e._zod.processJSONSchema = (t, n, r) => io(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function ys(e) {
	return new vs({
		type: "optional",
		innerType: e
	});
}
var bs = /*@__PURE__*/ k("ZodNullable", (e, t) => {
	Or.init(e, t), K.init(e, t), e._zod.processJSONSchema = (t, n, r) => Ya(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function xs(e) {
	return new bs({
		type: "nullable",
		innerType: e
	});
}
var Ss = /*@__PURE__*/ k("ZodDefault", (e, t) => {
	kr.init(e, t), K.init(e, t), e._zod.processJSONSchema = (t, n, r) => $a(e, t, n, r), e.unwrap = () => e._zod.def.innerType, e.removeDefault = e.unwrap;
});
function Cs(e, t) {
	return new Ss({
		type: "default",
		innerType: e,
		get defaultValue() {
			return typeof t == "function" ? t() : ie(t);
		}
	});
}
var ws = /*@__PURE__*/ k("ZodPrefault", (e, t) => {
	jr.init(e, t), K.init(e, t), e._zod.processJSONSchema = (t, n, r) => eo(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function Ts(e, t) {
	return new ws({
		type: "prefault",
		innerType: e,
		get defaultValue() {
			return typeof t == "function" ? t() : ie(t);
		}
	});
}
var Es = /*@__PURE__*/ k("ZodNonOptional", (e, t) => {
	Mr.init(e, t), K.init(e, t), e._zod.processJSONSchema = (t, n, r) => Xa(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function Ds(e, t) {
	return new Es({
		type: "nonoptional",
		innerType: e,
		...x(t)
	});
}
var Os = /*@__PURE__*/ k("ZodCatch", (e, t) => {
	Fr.init(e, t), K.init(e, t), e._zod.processJSONSchema = (t, n, r) => to(e, t, n, r), e.unwrap = () => e._zod.def.innerType, e.removeCatch = e.unwrap;
});
function ks(e, t) {
	return new Os({
		type: "catch",
		innerType: e,
		catchValue: typeof t == "function" ? t : Fe(t)
	});
}
var As = /*@__PURE__*/ k("ZodPipe", (e, t) => {
	Ir.init(e, t), K.init(e, t), e._zod.processJSONSchema = (t, n, r) => no(e, t, n, r), e.in = t.in, e.out = t.out;
});
function js(e, t) {
	return new As({
		type: "pipe",
		in: e,
		out: t
	});
}
var Ms = /*@__PURE__*/ k("ZodReadonly", (e, t) => {
	Rr.init(e, t), K.init(e, t), e._zod.processJSONSchema = (t, n, r) => ro(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function Ns(e) {
	return new Ms({
		type: "readonly",
		innerType: e
	});
}
var Ps = /*@__PURE__*/ k("ZodCustom", (e, t) => {
	Br.init(e, t), K.init(e, t), e._zod.processJSONSchema = (t, n, r) => Ha(e, t, n, r);
});
function Fs(e, t = {}) {
	return /* @__PURE__ */ la(Ps, e, t);
}
function Is(e, t) {
	return /* @__PURE__ */ ua(e, t);
}
//#endregion
//#region node_modules/zod/v4/classic/compat.js
var Ls = {
	invalid_type: "invalid_type",
	too_big: "too_big",
	too_small: "too_small",
	invalid_format: "invalid_format",
	not_multiple_of: "not_multiple_of",
	unrecognized_keys: "unrecognized_keys",
	invalid_union: "invalid_union",
	invalid_key: "invalid_key",
	invalid_element: "invalid_element",
	invalid_value: "invalid_value",
	custom: "custom"
}, Rs;
Rs ||= {};
//#endregion
//#region packages/shared/index.ts
function zs(e) {
	if (!e || e.length > 512 || e.startsWith("/") || e.startsWith("\\") || /[\\\x00-\x1f\x7f:#?]/.test(e)) return !1;
	let t;
	try {
		t = decodeURIComponent(e);
	} catch {
		return !1;
	}
	return t === e && e.split("/").every((e) => e !== "" && e !== "." && e !== ".." && e.trim() === e && !e.endsWith(".") && !/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(e));
}
function Bs(e) {
	if (/[\x00-\x20\x7f]/.test(e) || e.length > 4096) return !1;
	try {
		let t = new URL(e);
		return (t.protocol === "https:" || t.protocol === "http:") && !!t.hostname && !t.username && !t.password || t.protocol === "mailto:" && !!t.pathname && !t.search && !t.hash;
	} catch {
		return !1;
	}
}
var Vs = q().refine(zs, "Expected a safe relative asset path"), Hs = q().refine(Bs, "Only HTTP, HTTPS, and plain mailto links are supported"), Us = q().regex(/^#[0-9a-fA-F]{6}$/, "Expected a six-digit hexadecimal color"), Ws = X({
	preset: ps("magazine"),
	layout: Z([
		"auto",
		"spread",
		"single"
	]),
	showCoverAlone: Zo(),
	backgroundColor: Us,
	backgroundImage: Vs.nullable(),
	toolbarTheme: Z(["light", "dark"]),
	turnDurationMs: Y().int().min(200).max(2500),
	shadowStrength: Y().min(0).max(1),
	showPageEdges: Zo(),
	motionPreference: Z([
		"system",
		"full",
		"reduced"
	])
}).strict(), Gs = X({
	path: Vs,
	width: Y().int().positive().max(64e3),
	height: Y().int().positive().max(64e3)
}).strict(), Ks = X({
	x: Y().min(0).max(1),
	y: Y().min(0).max(1),
	width: Y().min(0).max(1),
	height: Y().min(0).max(1),
	label: q().max(2048),
	target: cs("type", [X({
		type: ps("page"),
		sourcePage: Y().int().positive()
	}).strict(), X({
		type: ps("external"),
		href: Hs
	}).strict()])
}).strict().superRefine((e, t) => {
	(e.x + e.width > 1.00001 || e.y + e.height > 1.00001) && t.addIssue({
		code: Ls.custom,
		message: "Link rectangle extends outside displayed artwork"
	});
}), qs = X({
	sourcePage: Y().int().positive().max(300),
	label: q().max(256),
	aspectRatio: Y().positive().max(100),
	image: Gs,
	zoomImage: Gs,
	thumbnail: Gs,
	textPath: Vs.nullable(),
	links: rs(Ks).max(1e4)
}).strict(), Js = X({
	schemaVersion: ps("2.0"),
	title: q().trim().min(1).max(240),
	pageCount: Y().int().min(1).max(300),
	settings: Ws,
	pages: rs(qs).min(1).max(300),
	outline: rs(X({
		title: q().max(2048),
		sourcePage: Y().int().positive()
	}).strict()).max(1e4),
	originalPdf: Vs.nullable()
}).strict().superRefine((e, t) => {
	e.pageCount !== e.pages.length && t.addIssue({
		code: Ls.custom,
		path: ["pageCount"],
		message: "Page count must equal the number of source pages"
	}), e.pages.forEach((n, r) => {
		n.sourcePage !== r + 1 && t.addIssue({
			code: Ls.custom,
			path: [
				"pages",
				r,
				"sourcePage"
			],
			message: "Source pages must be consecutive, one-based, and ordered"
		}), n.links.forEach((n, i) => {
			n.target.type === "page" && n.target.sourcePage > e.pageCount && t.addIssue({
				code: Ls.custom,
				path: [
					"pages",
					r,
					"links",
					i,
					"target"
				],
				message: "Link target is outside the source document"
			});
		});
	}), e.outline.forEach((n, r) => {
		n.sourcePage > e.pageCount && t.addIssue({
			code: Ls.custom,
			path: [
				"outline",
				r,
				"sourcePage"
			],
			message: "Outline target is outside the source document"
		});
	});
}), Ys = Z(["standard", "lossless"]), Xs = q().regex(/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,95}$/, "Invalid generated identifier");
X({
	id: Xs,
	title: q().trim().min(1).max(240),
	revision: Y().int().min(1),
	createdAt: q().datetime(),
	updatedAt: q().datetime(),
	settings: Ws,
	quality: Ys,
	sourceFileName: q().max(256),
	pageCount: Y().int().min(0).max(300),
	currentBuildId: Xs.nullable(),
	status: Z([
		"draft",
		"converting",
		"ready",
		"error",
		"cancelled"
	]),
	error: q().max(4096).nullable()
}).strict(), X({
	buildId: Xs,
	completedAt: q().datetime()
}).strict(), X({
	maxInputBytes: Y().int().positive().max(1073741824),
	maxPages: Y().int().min(1).max(300),
	maxPagePixels: Y().int().positive().max(1e8),
	pageTimeoutMs: Y().int().min(1e3).max(6e5),
	maxOutputBytes: Y().int().positive(),
	minimumFreeDiskBytes: Y().int().nonnegative()
}).strict(), X({
	sourcePage: Y().int().positive().max(300),
	text: q().max(1e7)
}).strict();
//#endregion
//#region packages/reader/assets.ts
var Zs = (/* @__PURE__ */ e(((e, t) => {
	(function(n, r) {
		typeof e == "object" && t !== void 0 ? r(e) : typeof define == "function" && define.amd ? define(["exports"], r) : r((n ||= self).St = {});
	})(e, (function(e) {
		class t {
			constructor(e, t) {
				this.state = {
					angle: 0,
					area: [],
					position: {
						x: 0,
						y: 0
					},
					hardAngle: 0,
					hardDrawingAngle: 0
				}, this.createdDensity = t, this.nowDrawingDensity = this.createdDensity, this.render = e;
			}
			setDensity(e) {
				this.createdDensity = e, this.nowDrawingDensity = e;
			}
			setDrawingDensity(e) {
				this.nowDrawingDensity = e;
			}
			setPosition(e) {
				this.state.position = e;
			}
			setAngle(e) {
				this.state.angle = e;
			}
			setArea(e) {
				this.state.area = e;
			}
			setHardDrawingAngle(e) {
				this.state.hardDrawingAngle = e;
			}
			setHardAngle(e) {
				this.state.hardAngle = e, this.state.hardDrawingAngle = e;
			}
			setOrientation(e) {
				this.orientation = e;
			}
			getDrawingDensity() {
				return this.nowDrawingDensity;
			}
			getDensity() {
				return this.createdDensity;
			}
			getHardAngle() {
				return this.state.hardAngle;
			}
		}
		class n extends t {
			constructor(e, t, n) {
				super(e, n), this.image = null, this.isLoad = !1, this.loadingAngle = 0, this.image = new Image(), this.image.src = t;
			}
			draw(e) {
				let t = this.render.getContext(), n = this.render.convertToGlobal(this.state.position), r = this.render.getRect().pageWidth, i = this.render.getRect().height;
				t.save(), t.translate(n.x, n.y), t.beginPath();
				for (let e of this.state.area) e !== null && (e = this.render.convertToGlobal(e), t.lineTo(e.x - n.x, e.y - n.y));
				t.rotate(this.state.angle), t.clip(), this.isLoad ? t.drawImage(this.image, 0, 0, r, i) : this.drawLoader(t, {
					x: 0,
					y: 0
				}, r, i), t.restore();
			}
			simpleDraw(e) {
				let t = this.render.getRect(), n = this.render.getContext(), r = t.pageWidth, i = t.height, a = e === 1 ? t.left + t.pageWidth : t.left, o = t.top;
				this.isLoad ? n.drawImage(this.image, a, o, r, i) : this.drawLoader(n, {
					x: a,
					y: o
				}, r, i);
			}
			drawLoader(e, t, n, r) {
				e.beginPath(), e.strokeStyle = "rgb(200, 200, 200)", e.fillStyle = "rgb(255, 255, 255)", e.lineWidth = 1, e.rect(t.x + 1, t.y + 1, n - 1, r - 1), e.stroke(), e.fill();
				let i = {
					x: t.x + n / 2,
					y: t.y + r / 2
				};
				e.beginPath(), e.lineWidth = 10, e.arc(i.x, i.y, 20, this.loadingAngle, 3 * Math.PI / 2 + this.loadingAngle), e.stroke(), e.closePath(), this.loadingAngle += .07, this.loadingAngle >= 2 * Math.PI && (this.loadingAngle = 0);
			}
			load() {
				this.isLoad || (this.image.onload = () => {
					this.isLoad = !0;
				});
			}
			newTemporaryCopy() {
				return this;
			}
			getTemporaryCopy() {
				return this;
			}
			hideTemporaryCopy() {}
		}
		class r {
			constructor(e, t) {
				this.pages = [], this.currentPageIndex = 0, this.currentSpreadIndex = 0, this.landscapeSpread = [], this.portraitSpread = [], this.render = t, this.app = e, this.currentPageIndex = 0, this.isShowCover = this.app.getSettings().showCover;
			}
			destroy() {
				this.pages = [];
			}
			createSpread() {
				this.landscapeSpread = [], this.portraitSpread = [];
				for (let e = 0; e < this.pages.length; e++) this.portraitSpread.push([e]);
				let e = 0;
				this.isShowCover && (this.pages[0].setDensity("hard"), this.landscapeSpread.push([e]), e++);
				for (let t = e; t < this.pages.length; t += 2) t < this.pages.length - 1 ? this.landscapeSpread.push([t, t + 1]) : (this.landscapeSpread.push([t]), this.pages[t].setDensity("hard"));
			}
			getSpread() {
				return this.render.getOrientation() === "landscape" ? this.landscapeSpread : this.portraitSpread;
			}
			getSpreadIndexByPage(e) {
				let t = this.getSpread();
				for (let n = 0; n < t.length; n++) if (e === t[n][0] || e === t[n][1]) return n;
				return null;
			}
			getPageCount() {
				return this.pages.length;
			}
			getPages() {
				return this.pages;
			}
			getPage(e) {
				if (e >= 0 && e < this.pages.length) return this.pages[e];
				throw Error("Invalid page number");
			}
			nextBy(e) {
				let t = this.pages.indexOf(e);
				return t < this.pages.length - 1 ? this.pages[t + 1] : null;
			}
			prevBy(e) {
				let t = this.pages.indexOf(e);
				return t > 0 ? this.pages[t - 1] : null;
			}
			getFlippingPage(e) {
				let t = this.currentSpreadIndex;
				if (this.render.getOrientation() === "portrait") return e === 0 ? this.pages[t].newTemporaryCopy(this.pages[t + 1]) : this.pages[t - 1];
				{
					let n = e === 0 ? this.getSpread()[t + 1] : this.getSpread()[t - 1];
					return n.length === 1 || e === 0 ? this.pages[n[0]] : this.pages[n[1]];
				}
			}
			getBottomPage(e) {
				let t = this.currentSpreadIndex;
				if (this.render.getOrientation() === "portrait") return e === 0 ? this.pages[t + 1] : this.pages[t - 1];
				{
					let n = e === 0 ? this.getSpread()[t + 1] : this.getSpread()[t - 1];
					return n.length === 1 ? this.pages[n[0]] : e === 0 ? this.pages[n[1]] : this.pages[n[0]];
				}
			}
			showNext() {
				this.currentSpreadIndex < this.getSpread().length && (this.currentSpreadIndex++, this.showSpread());
			}
			showPrev() {
				this.currentSpreadIndex > 0 && (this.currentSpreadIndex--, this.showSpread());
			}
			getCurrentPageIndex() {
				return this.currentPageIndex;
			}
			show(e = null) {
				if (e === null && (e = this.currentPageIndex), e < 0 || e >= this.pages.length) return;
				let t = this.getSpreadIndexByPage(e);
				t !== null && (this.currentSpreadIndex = t, this.showSpread());
			}
			getCurrentSpreadIndex() {
				return this.currentSpreadIndex;
			}
			setCurrentSpreadIndex(e) {
				if (!(e >= 0 && e < this.getSpread().length)) throw Error("Invalid page");
				this.currentSpreadIndex = e;
			}
			showSpread() {
				let e = this.getSpread()[this.currentSpreadIndex];
				e.length === 2 ? (this.render.setLeftPage(this.pages[e[0]]), this.render.setRightPage(this.pages[e[1]])) : this.render.getOrientation() === "landscape" && e[0] === this.pages.length - 1 ? (this.render.setLeftPage(this.pages[e[0]]), this.render.setRightPage(null)) : (this.render.setLeftPage(null), this.render.setRightPage(this.pages[e[0]])), this.currentPageIndex = e[0], this.app.updatePageIndex(this.currentPageIndex);
			}
		}
		class i extends r {
			constructor(e, t, n) {
				super(e, t), this.imagesHref = n;
			}
			load() {
				for (let e of this.imagesHref) {
					let t = new n(this.render, e, "soft");
					t.load(), this.pages.push(t);
				}
				this.createSpread();
			}
		}
		class a {
			static GetDistanceBetweenTwoPoint(e, t) {
				return e === null || t === null ? 1 / 0 : Math.sqrt((t.x - e.x) ** 2 + (t.y - e.y) ** 2);
			}
			static GetSegmentLength(e) {
				return a.GetDistanceBetweenTwoPoint(e[0], e[1]);
			}
			static GetAngleBetweenTwoLine(e, t) {
				let n = e[0].y - e[1].y, r = t[0].y - t[1].y, i = e[1].x - e[0].x, a = t[1].x - t[0].x;
				return Math.acos((n * r + i * a) / (Math.sqrt(n * n + i * i) * Math.sqrt(r * r + a * a)));
			}
			static PointInRect(e, t) {
				return t === null ? null : t.x >= e.left && t.x <= e.width + e.left && t.y >= e.top && t.y <= e.top + e.height ? t : null;
			}
			static GetRotatedPoint(e, t, n) {
				return {
					x: e.x * Math.cos(n) + e.y * Math.sin(n) + t.x,
					y: e.y * Math.cos(n) - e.x * Math.sin(n) + t.y
				};
			}
			static LimitPointToCircle(e, t, n) {
				if (a.GetDistanceBetweenTwoPoint(e, n) <= t) return n;
				let r = e.x, i = e.y, o = n.x, s = n.y, c = Math.sqrt(t ** 2 * (r - o) ** 2 / ((r - o) ** 2 + (i - s) ** 2)) + r;
				n.x < 0 && (c *= -1);
				let l = (c - r) * (i - s) / (r - o) + i;
				return r - o + i === 0 && (l = t), {
					x: c,
					y: l
				};
			}
			static GetIntersectBetweenTwoSegment(e, t, n) {
				return a.PointInRect(e, a.GetIntersectBeetwenTwoLine(t, n));
			}
			static GetIntersectBeetwenTwoLine(e, t) {
				let n = e[0].y - e[1].y, r = t[0].y - t[1].y, i = e[1].x - e[0].x, a = t[1].x - t[0].x, o = e[0].x * e[1].y - e[1].x * e[0].y, s = t[0].x * t[1].y - t[1].x * t[0].y, c = n * s - r * o, l = i * s - a * o, u = -(o * a - s * i) / (n * a - r * i), d = -(n * s - r * o) / (n * a - r * i);
				if (isFinite(u) && isFinite(d)) return {
					x: u,
					y: d
				};
				if (Math.abs(c - l) < .1) throw Error("Segment included");
				return null;
			}
			static GetCordsFromTwoPoint(e, t) {
				let n = Math.abs(e.x - t.x), r = Math.abs(e.y - t.y), i = Math.max(n, r), a = [e];
				function o(e, t, n, r, i) {
					return t > e ? e + n / r * i : t < e ? e - n / r * i : e;
				}
				for (let s = 1; s <= i; s += 1) a.push({
					x: o(e.x, t.x, n, i, s),
					y: o(e.y, t.y, r, i, s)
				});
				return a;
			}
		}
		class o extends t {
			constructor(e, t, n) {
				super(e, n), this.copiedElement = null, this.temporaryCopy = null, this.isLoad = !1, this.element = t, this.element.classList.add("stf__item"), this.element.classList.add("--" + n);
			}
			newTemporaryCopy(e) {
				return this.nowDrawingDensity === "hard" ? this : (this.temporaryCopy === null && (this.copiedElement = (e && e.getElement ? e.getElement() : this.element).cloneNode(!0), this.element.parentElement.appendChild(this.copiedElement), this.temporaryCopy = new o(this.render, this.copiedElement, this.nowDrawingDensity)), this.getTemporaryCopy());
			}
			getTemporaryCopy() {
				return this.temporaryCopy;
			}
			hideTemporaryCopy() {
				this.temporaryCopy !== null && (this.copiedElement.remove(), this.copiedElement = null, this.temporaryCopy = null);
			}
			draw(e) {
				let t = e || this.nowDrawingDensity, n = this.render.convertToGlobal(this.state.position), r = this.render.getRect().pageWidth, i = this.render.getRect().height;
				this.element.classList.remove("--simple");
				let a = `\n            display: block;\n            z-index: ${this.element.style.zIndex};\n            left: 0;\n            top: 0;\n            width: ${r}px;\n            height: ${i}px;\n        `;
				t === "hard" ? this.drawHard(a) : this.drawSoft(n, a);
			}
			drawHard(e = "") {
				let t = this.render.getRect().left + this.render.getRect().width / 2, n = this.state.hardDrawingAngle, r = e + "\n                backface-visibility: hidden;\n                -webkit-backface-visibility: hidden;\n                clip-path: none;\n                -webkit-clip-path: none;\n            " + (this.orientation === 0 ? `transform-origin: ${this.render.getRect().pageWidth}px 0; \n                   transform: translate3d(0, 0, 0) rotateY(${n}deg);` : `transform-origin: 0 0; \n                   transform: translate3d(${t}px, 0, 0) rotateY(${n}deg);`);
				this.element.style.cssText = r;
			}
			drawSoft(e, t = "") {
				let n = "polygon( ";
				for (let e of this.state.area) if (e !== null) {
					let t = this.render.getDirection() === 1 ? {
						x: -e.x + this.state.position.x,
						y: e.y - this.state.position.y
					} : {
						x: e.x - this.state.position.x,
						y: e.y - this.state.position.y
					};
					t = a.GetRotatedPoint(t, {
						x: 0,
						y: 0
					}, this.state.angle), n += t.x + "px " + t.y + "px, ";
				}
				n = n.slice(0, -2), n += ")";
				let r = t + `transform-origin: 0 0; clip-path: ${n}; -webkit-clip-path: ${n};` + (this.render.isSafari() && this.state.angle === 0 ? `transform: translate(${e.x}px, ${e.y}px);` : `transform: translate3d(${e.x}px, ${e.y}px, 0) rotate(${this.state.angle}rad);`);
				this.element.style.cssText = r;
			}
			simpleDraw(e) {
				let t = this.render.getRect(), n = t.pageWidth, r = t.height, i = e === 1 ? t.left + t.pageWidth : t.left, a = t.top;
				this.element.classList.add("--simple"), this.element.style.cssText = `\n            position: absolute; \n            display: block; \n            height: ${r}px; \n            left: ${i}px; \n            top: ${a}px; \n            width: ${n}px; \n            z-index: ${this.render.getSettings().startZIndex + 1};`;
			}
			getElement() {
				return this.element;
			}
			load() {
				this.isLoad = !0;
			}
			setOrientation(e) {
				super.setOrientation(e), this.element.classList.remove("--left", "--right"), this.element.classList.add(e === 1 ? "--right" : "--left");
			}
			setDrawingDensity(e) {
				this.element.classList.remove("--soft", "--hard"), this.element.classList.add("--" + e), super.setDrawingDensity(e);
			}
		}
		class s extends r {
			constructor(e, t, n, r) {
				super(e, t), this.element = n, this.pagesElement = r;
			}
			load() {
				for (let e of this.pagesElement) {
					let t = new o(this.render, e, e.dataset.density === "hard" ? "hard" : "soft");
					t.load(), this.pages.push(t);
				}
				this.createSpread();
			}
		}
		class c {
			constructor(e, t, n, r) {
				this.direction = e, this.corner = t, this.topIntersectPoint = null, this.sideIntersectPoint = null, this.bottomIntersectPoint = null, this.pageWidth = parseInt(n, 10), this.pageHeight = parseInt(r, 10);
			}
			calc(e) {
				try {
					return this.position = this.calcAngleAndPosition(e), this.calculateIntersectPoint(this.position), !0;
				} catch {
					return !1;
				}
			}
			getFlippingClipArea() {
				let e = [], t = !1;
				return e.push(this.rect.topLeft), e.push(this.topIntersectPoint), this.sideIntersectPoint === null ? t = !0 : (e.push(this.sideIntersectPoint), this.bottomIntersectPoint === null && (t = !1)), e.push(this.bottomIntersectPoint), (t || this.corner === "bottom") && e.push(this.rect.bottomLeft), e;
			}
			getBottomClipArea() {
				let e = [];
				return e.push(this.topIntersectPoint), this.corner === "top" ? e.push({
					x: this.pageWidth,
					y: 0
				}) : (this.topIntersectPoint !== null && e.push({
					x: this.pageWidth,
					y: 0
				}), e.push({
					x: this.pageWidth,
					y: this.pageHeight
				})), this.sideIntersectPoint === null ? this.corner === "top" && e.push({
					x: this.pageWidth,
					y: this.pageHeight
				}) : a.GetDistanceBetweenTwoPoint(this.sideIntersectPoint, this.topIntersectPoint) >= 10 && e.push(this.sideIntersectPoint), e.push(this.bottomIntersectPoint), e.push(this.topIntersectPoint), e;
			}
			getAngle() {
				return this.direction === 0 ? -this.angle : this.angle;
			}
			getRect() {
				return this.rect;
			}
			getPosition() {
				return this.position;
			}
			getActiveCorner() {
				return this.direction === 0 ? this.rect.topLeft : this.rect.topRight;
			}
			getDirection() {
				return this.direction;
			}
			getFlippingProgress() {
				return Math.abs((this.position.x - this.pageWidth) / (2 * this.pageWidth) * 100);
			}
			getCorner() {
				return this.corner;
			}
			getBottomPagePosition() {
				return this.direction === 1 ? {
					x: this.pageWidth,
					y: 0
				} : {
					x: 0,
					y: 0
				};
			}
			getShadowStartPoint() {
				return this.corner === "top" || this.sideIntersectPoint === null ? this.topIntersectPoint : this.sideIntersectPoint;
			}
			getShadowAngle() {
				let e = a.GetAngleBetweenTwoLine(this.getSegmentToShadowLine(), [{
					x: 0,
					y: 0
				}, {
					x: this.pageWidth,
					y: 0
				}]);
				return this.direction === 0 ? e : Math.PI - e;
			}
			calcAngleAndPosition(e) {
				let t = e;
				if (this.updateAngleAndGeometry(t), t = this.corner === "top" ? this.checkPositionAtCenterLine(t, {
					x: 0,
					y: 0
				}, {
					x: 0,
					y: this.pageHeight
				}) : this.checkPositionAtCenterLine(t, {
					x: 0,
					y: this.pageHeight
				}, {
					x: 0,
					y: 0
				}), Math.abs(t.x - this.pageWidth) < 1 && Math.abs(t.y) < 1) throw Error("Point is too small");
				return t;
			}
			updateAngleAndGeometry(e) {
				this.angle = this.calculateAngle(e), this.rect = this.getPageRect(e);
			}
			calculateAngle(e) {
				let t = this.pageWidth - e.x + 1, n = this.corner === "bottom" ? this.pageHeight - e.y : e.y, r = 2 * Math.acos(t / Math.sqrt(n * n + t * t));
				n < 0 && (r = -r);
				let i = Math.PI - r;
				if (!isFinite(r) || i >= 0 && i < .003) throw Error("The G point is too small");
				return this.corner === "bottom" && (r = -r), r;
			}
			getPageRect(e) {
				return this.corner === "top" ? this.getRectFromBasePoint([
					{
						x: 0,
						y: 0
					},
					{
						x: this.pageWidth,
						y: 0
					},
					{
						x: 0,
						y: this.pageHeight
					},
					{
						x: this.pageWidth,
						y: this.pageHeight
					}
				], e) : this.getRectFromBasePoint([
					{
						x: 0,
						y: -this.pageHeight
					},
					{
						x: this.pageWidth,
						y: -this.pageHeight
					},
					{
						x: 0,
						y: 0
					},
					{
						x: this.pageWidth,
						y: 0
					}
				], e);
			}
			getRectFromBasePoint(e, t) {
				return {
					topLeft: this.getRotatedPoint(e[0], t),
					topRight: this.getRotatedPoint(e[1], t),
					bottomLeft: this.getRotatedPoint(e[2], t),
					bottomRight: this.getRotatedPoint(e[3], t)
				};
			}
			getRotatedPoint(e, t) {
				return {
					x: e.x * Math.cos(this.angle) + e.y * Math.sin(this.angle) + t.x,
					y: e.y * Math.cos(this.angle) - e.x * Math.sin(this.angle) + t.y
				};
			}
			calculateIntersectPoint(e) {
				let t = {
					left: -1,
					top: -1,
					width: this.pageWidth + 2,
					height: this.pageHeight + 2
				};
				this.corner === "top" ? (this.topIntersectPoint = a.GetIntersectBetweenTwoSegment(t, [e, this.rect.topRight], [{
					x: 0,
					y: 0
				}, {
					x: this.pageWidth,
					y: 0
				}]), this.sideIntersectPoint = a.GetIntersectBetweenTwoSegment(t, [e, this.rect.bottomLeft], [{
					x: this.pageWidth,
					y: 0
				}, {
					x: this.pageWidth,
					y: this.pageHeight
				}]), this.bottomIntersectPoint = a.GetIntersectBetweenTwoSegment(t, [this.rect.bottomLeft, this.rect.bottomRight], [{
					x: 0,
					y: this.pageHeight
				}, {
					x: this.pageWidth,
					y: this.pageHeight
				}])) : (this.topIntersectPoint = a.GetIntersectBetweenTwoSegment(t, [this.rect.topLeft, this.rect.topRight], [{
					x: 0,
					y: 0
				}, {
					x: this.pageWidth,
					y: 0
				}]), this.sideIntersectPoint = a.GetIntersectBetweenTwoSegment(t, [e, this.rect.topLeft], [{
					x: this.pageWidth,
					y: 0
				}, {
					x: this.pageWidth,
					y: this.pageHeight
				}]), this.bottomIntersectPoint = a.GetIntersectBetweenTwoSegment(t, [this.rect.bottomLeft, this.rect.bottomRight], [{
					x: 0,
					y: this.pageHeight
				}, {
					x: this.pageWidth,
					y: this.pageHeight
				}]));
			}
			checkPositionAtCenterLine(e, t, n) {
				let r = e, i = a.LimitPointToCircle(t, this.pageWidth, r);
				r !== i && (r = i, this.updateAngleAndGeometry(r));
				let o = Math.sqrt(this.pageWidth ** 2 + this.pageHeight ** 2), s = this.rect.bottomRight, c = this.rect.topLeft;
				if (this.corner === "bottom" && (s = this.rect.topRight, c = this.rect.bottomLeft), s.x <= 0) {
					let e = a.LimitPointToCircle(n, o, c);
					e !== r && (r = e, this.updateAngleAndGeometry(r));
				}
				return r;
			}
			getSegmentToShadowLine() {
				let e = this.getShadowStartPoint();
				return [e, e !== this.sideIntersectPoint && this.sideIntersectPoint !== null ? this.sideIntersectPoint : this.bottomIntersectPoint];
			}
		}
		class l {
			constructor(e, t) {
				this.flippingPage = null, this.bottomPage = null, this.calc = null, this.state = "read", this.render = e, this.app = t;
			}
			fold(e) {
				this.setState("user_fold"), this.calc === null && this.start(e), this.do(this.render.convertToPage(e));
			}
			flip(e) {
				if (this.app.getSettings().disableFlipByClick && !this.isPointOnCorners(e) || (this.calc !== null && this.render.finishAnimation(), !this.start(e))) return;
				let t = this.getBoundsRect();
				this.setState("flipping");
				let n = t.height / 10, r = this.calc.getCorner() === "bottom" ? t.height - n : n, i = this.calc.getCorner() === "bottom" ? t.height : 0;
				this.calc.calc({
					x: t.pageWidth - n,
					y: r
				}), this.animateFlippingTo({
					x: t.pageWidth - n,
					y: r
				}, {
					x: -t.pageWidth,
					y: i
				}, !0);
			}
			start(e) {
				this.reset();
				let t = this.render.convertToBook(e), n = this.getBoundsRect(), r = this.getDirectionByPoint(t), i = t.y >= n.height / 2 ? "bottom" : "top";
				if (!this.checkDirection(r)) return !1;
				try {
					if (this.flippingPage = this.app.getPageCollection().getFlippingPage(r), this.bottomPage = this.app.getPageCollection().getBottomPage(r), this.render.getOrientation() === "landscape") {
						if (r === 1) {
							let e = this.app.getPageCollection().nextBy(this.flippingPage);
							e !== null && this.flippingPage.getDensity() !== e.getDensity() && (this.flippingPage.setDrawingDensity("hard"), e.setDrawingDensity("hard"));
						} else {
							let e = this.app.getPageCollection().prevBy(this.flippingPage);
							e !== null && this.flippingPage.getDensity() !== e.getDensity() && (this.flippingPage.setDrawingDensity("hard"), e.setDrawingDensity("hard"));
						}
					}
					return this.render.setDirection(r), this.calc = new c(r, i, n.pageWidth.toString(10), n.height.toString(10)), !0;
				} catch {
					return !1;
				}
			}
			do(e) {
				if (this.calc !== null && this.calc.calc(e)) {
					let e = this.calc.getFlippingProgress();
					this.bottomPage.setArea(this.calc.getBottomClipArea()), this.bottomPage.setPosition(this.calc.getBottomPagePosition()), this.bottomPage.setAngle(0), this.bottomPage.setHardAngle(0), this.flippingPage.setArea(this.calc.getFlippingClipArea()), this.flippingPage.setPosition(this.calc.getActiveCorner()), this.flippingPage.setAngle(this.calc.getAngle()), this.calc.getDirection() === 0 ? this.flippingPage.setHardAngle(90 * (200 - 2 * e) / 100) : this.flippingPage.setHardAngle(-90 * (200 - 2 * e) / 100), this.render.setPageRect(this.calc.getRect()), this.render.setBottomPage(this.bottomPage), this.render.setFlippingPage(this.flippingPage), this.render.setShadowData(this.calc.getShadowStartPoint(), this.calc.getShadowAngle(), e, this.calc.getDirection());
				}
			}
			flipToPage(e, t) {
				let n = this.app.getPageCollection().getCurrentSpreadIndex(), r = this.app.getPageCollection().getSpreadIndexByPage(e);
				try {
					r > n && (this.app.getPageCollection().setCurrentSpreadIndex(r - 1), this.flipNext(t)), r < n && (this.app.getPageCollection().setCurrentSpreadIndex(r + 1), this.flipPrev(t));
				} catch {}
			}
			flipNext(e) {
				this.flip({
					x: this.render.getRect().left + 2 * this.render.getRect().pageWidth - 10,
					y: e === "top" ? 1 : this.render.getRect().height - 2
				});
			}
			flipPrev(e) {
				this.flip({
					x: 10,
					y: e === "top" ? 1 : this.render.getRect().height - 2
				});
			}
			stopMove() {
				if (this.calc === null) return;
				let e = this.calc.getPosition(), t = this.getBoundsRect(), n = this.calc.getCorner() === "bottom" ? t.height : 0;
				e.x <= 0 ? this.animateFlippingTo(e, {
					x: -t.pageWidth,
					y: n
				}, !0) : this.animateFlippingTo(e, {
					x: t.pageWidth,
					y: n
				}, !1);
			}
			showCorner(e) {
				if (!this.checkState("read", "fold_corner")) return;
				let t = this.getBoundsRect(), n = t.pageWidth;
				if (this.isPointOnCorners(e)) {
					if (this.calc === null) {
						if (!this.start(e)) return;
						this.setState("fold_corner"), this.calc.calc({
							x: n - 1,
							y: 1
						});
						let r = this.calc.getCorner() === "bottom" ? t.height - 1 : 1, i = this.calc.getCorner() === "bottom" ? t.height - 50 : 50;
						this.animateFlippingTo({
							x: n - 1,
							y: r
						}, {
							x: n - 50,
							y: i
						}, !1, !1);
					} else this.do(this.render.convertToPage(e));
				} else this.setState("read"), this.render.finishAnimation(), this.stopMove();
			}
			animateFlippingTo(e, t, n, r = !0) {
				let i = a.GetCordsFromTwoPoint(e, t), o = [];
				for (let e of i) o.push(() => this.do(e));
				let s = this.getAnimationDuration(i.length);
				this.render.startAnimation(o, s, () => {
					this.calc && (n && (this.calc.getDirection() === 1 ? this.app.turnToPrevPage() : this.app.turnToNextPage()), r && (this.render.setBottomPage(null), this.render.setFlippingPage(null), this.render.clearShadow(), this.setState("read"), this.reset()));
				});
			}
			getCalculation() {
				return this.calc;
			}
			getState() {
				return this.state;
			}
			setState(e) {
				this.state !== e && (this.app.updateState(e), this.state = e);
			}
			getDirectionByPoint(e) {
				let t = this.getBoundsRect();
				if (this.render.getOrientation() === "portrait") {
					if (e.x - t.pageWidth <= t.width / 5) return 1;
				} else if (e.x < t.width / 2) return 1;
				return 0;
			}
			getAnimationDuration(e) {
				let t = this.app.getSettings().flippingTime;
				return e >= 1e3 ? t : e / 1e3 * t;
			}
			checkDirection(e) {
				return e === 0 ? this.app.getCurrentPageIndex() < this.app.getPageCount() - 1 : this.app.getCurrentPageIndex() >= 1;
			}
			reset() {
				this.calc = null, this.flippingPage = null, this.bottomPage = null;
			}
			getBoundsRect() {
				return this.render.getRect();
			}
			checkState(...e) {
				for (let t of e) if (this.state === t) return !0;
				return !1;
			}
			isPointOnCorners(e) {
				let t = this.getBoundsRect(), n = t.pageWidth, r = Math.sqrt(n ** 2 + t.height ** 2) / 5, i = this.render.convertToBook(e);
				return i.x > 0 && i.y > 0 && i.x < t.width && i.y < t.height && (i.x < r || i.x > t.width - r) && (i.y < r || i.y > t.height - r);
			}
		}
		class u {
			constructor(e, t) {
				this.leftPage = null, this.rightPage = null, this.flippingPage = null, this.bottomPage = null, this.direction = null, this.orientation = null, this.shadow = null, this.animation = null, this.pageRect = null, this.boundsRect = null, this.timer = 0, this.safari = !1, this.setting = t, this.app = e;
				let n = /* @__PURE__ */ RegExp("Version\\/[\\d\\.]+.*Safari/");
				this.safari = n.exec(window.navigator.userAgent) !== null;
			}
			render(e) {
				if (this.animation !== null) {
					let t = Math.round((e - this.animation.startedAt) / this.animation.durationFrame);
					t < this.animation.frames.length ? this.animation.frames[t]() : (this.animation.onAnimateEnd(), this.animation = null);
				}
				this.timer = e, this.drawFrame();
			}
			start() {
				this.__studioStopped = !1, this.update();
				let e = (t) => {
					this.__studioStopped || (this.render(t), this.__studioStopped || (this.__studioRaf = requestAnimationFrame(e)));
				};
				this.__studioRaf = requestAnimationFrame(e);
			}
			stop() {
				this.__studioStopped = !0, cancelAnimationFrame(this.__studioRaf), this.animation = null;
			}
			startAnimation(e, t, n) {
				this.finishAnimation(), this.animation = {
					frames: e,
					duration: t,
					durationFrame: t / e.length,
					onAnimateEnd: n,
					startedAt: this.timer
				};
			}
			finishAnimation() {
				this.animation !== null && (this.animation.frames[this.animation.frames.length - 1](), this.animation.onAnimateEnd !== null && this.animation.onAnimateEnd()), this.animation = null;
			}
			update() {
				this.boundsRect = null;
				let e = this.calculateBoundsRect();
				this.orientation !== e && (this.orientation = e, this.app.updateOrientation(e));
			}
			calculateBoundsRect() {
				let e = "landscape", t = this.getBlockWidth(), n = t / 2, r = this.getBlockHeight() / 2, i = this.setting.width / this.setting.height, a = this.setting.width, o = this.setting.height, s = n - a;
				return this.setting.size === "stretch" ? (t < 2 * this.setting.minWidth && this.app.getSettings().usePortrait && (e = "portrait"), a = e === "portrait" ? this.getBlockWidth() : this.getBlockWidth() / 2, a > this.setting.maxWidth && (a = this.setting.maxWidth), o = a / i, o > this.getBlockHeight() && (o = this.getBlockHeight(), a = o * i), s = e === "portrait" ? n - a / 2 - a : n - a) : t < 2 * a && this.app.getSettings().usePortrait && (e = "portrait", s = n - a / 2 - a), this.boundsRect = {
					left: s,
					top: r - o / 2,
					width: 2 * a,
					height: o,
					pageWidth: a
				}, e;
			}
			setShadowData(e, t, n, r) {
				if (!this.app.getSettings().drawShadow) return;
				let i = 100 * this.getSettings().maxShadowOpacity;
				this.shadow = {
					pos: e,
					angle: t,
					width: 3 * this.getRect().pageWidth / 4 * n / 100,
					opacity: (100 - n) * i / 100 / 100,
					direction: r,
					progress: 2 * n
				};
			}
			clearShadow() {
				this.shadow = null;
			}
			getBlockWidth() {
				return this.app.getUI().getDistElement().offsetWidth;
			}
			getBlockHeight() {
				return this.app.getUI().getDistElement().offsetHeight;
			}
			getDirection() {
				return this.direction;
			}
			getRect() {
				return this.boundsRect === null && this.calculateBoundsRect(), this.boundsRect;
			}
			getSettings() {
				return this.app.getSettings();
			}
			getOrientation() {
				return this.orientation;
			}
			setPageRect(e) {
				this.pageRect = e;
			}
			setDirection(e) {
				this.direction = e;
			}
			setRightPage(e) {
				e !== null && e.setOrientation(1), this.rightPage = e;
			}
			setLeftPage(e) {
				e !== null && e.setOrientation(0), this.leftPage = e;
			}
			setBottomPage(e) {
				e !== null && e.setOrientation(this.direction === 1 ? 0 : 1), this.bottomPage = e;
			}
			setFlippingPage(e) {
				e !== null && e.setOrientation(this.direction === 0 && this.orientation !== "portrait" ? 0 : 1), this.flippingPage = e;
			}
			convertToBook(e) {
				let t = this.getRect();
				return {
					x: e.x - t.left,
					y: e.y - t.top
				};
			}
			isSafari() {
				return this.safari;
			}
			convertToPage(e, t) {
				t ||= this.direction;
				let n = this.getRect();
				return {
					x: t === 0 ? e.x - n.left - n.width / 2 : n.width / 2 - e.x + n.left,
					y: e.y - n.top
				};
			}
			convertToGlobal(e, t) {
				if (t ||= this.direction, e == null) return null;
				let n = this.getRect();
				return {
					x: t === 0 ? e.x + n.left + n.width / 2 : n.width / 2 - e.x + n.left,
					y: e.y + n.top
				};
			}
			convertRectToGlobal(e, t) {
				return t ||= this.direction, {
					topLeft: this.convertToGlobal(e.topLeft, t),
					topRight: this.convertToGlobal(e.topRight, t),
					bottomLeft: this.convertToGlobal(e.bottomLeft, t),
					bottomRight: this.convertToGlobal(e.bottomRight, t)
				};
			}
		}
		class d extends u {
			constructor(e, t, n) {
				super(e, t), this.canvas = n, this.ctx = n.getContext("2d");
			}
			getContext() {
				return this.ctx;
			}
			reload() {}
			drawFrame() {
				this.clear(), this.orientation !== "portrait" && this.leftPage != null && this.leftPage.simpleDraw(0), this.rightPage != null && this.rightPage.simpleDraw(1), this.bottomPage != null && this.bottomPage.draw(), this.drawBookShadow(), this.flippingPage != null && this.flippingPage.draw(), this.shadow != null && (this.drawOuterShadow(), this.drawInnerShadow());
				let e = this.getRect();
				this.orientation === "portrait" && (this.ctx.beginPath(), this.ctx.rect(e.left + e.pageWidth, e.top, e.width, e.height), this.ctx.clip());
			}
			drawBookShadow() {
				let e = this.getRect();
				this.ctx.save(), this.ctx.beginPath();
				let t = e.width / 20;
				this.ctx.rect(e.left, e.top, e.width, e.height);
				let n = {
					x: e.left + e.width / 2 - t / 2,
					y: 0
				};
				this.ctx.translate(n.x, n.y);
				let r = this.ctx.createLinearGradient(0, 0, t, 0);
				r.addColorStop(0, "rgba(0, 0, 0, 0)"), r.addColorStop(.4, "rgba(0, 0, 0, 0.2)"), r.addColorStop(.49, "rgba(0, 0, 0, 0.1)"), r.addColorStop(.5, "rgba(0, 0, 0, 0.5)"), r.addColorStop(.51, "rgba(0, 0, 0, 0.4)"), r.addColorStop(1, "rgba(0, 0, 0, 0)"), this.ctx.clip(), this.ctx.fillStyle = r, this.ctx.fillRect(0, 0, t, 2 * e.height), this.ctx.restore();
			}
			drawOuterShadow() {
				let e = this.getRect();
				this.ctx.save(), this.ctx.beginPath(), this.ctx.rect(e.left, e.top, e.width, e.height);
				let t = this.convertToGlobal({
					x: this.shadow.pos.x,
					y: this.shadow.pos.y
				});
				this.ctx.translate(t.x, t.y), this.ctx.rotate(Math.PI + this.shadow.angle + Math.PI / 2);
				let n = this.ctx.createLinearGradient(0, 0, this.shadow.width, 0);
				this.shadow.direction === 0 ? (this.ctx.translate(0, -100), n.addColorStop(0, "rgba(0, 0, 0, " + this.shadow.opacity + ")"), n.addColorStop(1, "rgba(0, 0, 0, 0)")) : (this.ctx.translate(-this.shadow.width, -100), n.addColorStop(0, "rgba(0, 0, 0, 0)"), n.addColorStop(1, "rgba(0, 0, 0, " + this.shadow.opacity + ")")), this.ctx.clip(), this.ctx.fillStyle = n, this.ctx.fillRect(0, 0, this.shadow.width, 2 * e.height), this.ctx.restore();
			}
			drawInnerShadow() {
				let e = this.getRect();
				this.ctx.save(), this.ctx.beginPath();
				let t = this.convertToGlobal({
					x: this.shadow.pos.x,
					y: this.shadow.pos.y
				}), n = this.convertRectToGlobal(this.pageRect);
				this.ctx.moveTo(n.topLeft.x, n.topLeft.y), this.ctx.lineTo(n.topRight.x, n.topRight.y), this.ctx.lineTo(n.bottomRight.x, n.bottomRight.y), this.ctx.lineTo(n.bottomLeft.x, n.bottomLeft.y), this.ctx.translate(t.x, t.y), this.ctx.rotate(Math.PI + this.shadow.angle + Math.PI / 2);
				let r = 3 * this.shadow.width / 4, i = this.ctx.createLinearGradient(0, 0, r, 0);
				this.shadow.direction === 0 ? (this.ctx.translate(-r, -100), i.addColorStop(1, "rgba(0, 0, 0, " + this.shadow.opacity + ")"), i.addColorStop(.9, "rgba(0, 0, 0, 0.05)"), i.addColorStop(.7, "rgba(0, 0, 0, " + this.shadow.opacity + ")"), i.addColorStop(0, "rgba(0, 0, 0, 0)")) : (this.ctx.translate(0, -100), i.addColorStop(0, "rgba(0, 0, 0, " + this.shadow.opacity + ")"), i.addColorStop(.1, "rgba(0, 0, 0, 0.05)"), i.addColorStop(.3, "rgba(0, 0, 0, " + this.shadow.opacity + ")"), i.addColorStop(1, "rgba(0, 0, 0, 0)")), this.ctx.clip(), this.ctx.fillStyle = i, this.ctx.fillRect(0, 0, r, 2 * e.height), this.ctx.restore();
			}
			clear() {
				this.ctx.fillStyle = "white", this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
			}
		}
		class f {
			constructor(e, t, n) {
				this.touchPoint = null, this.swipeTimeout = 250, this.onResize = () => {
					!1 !== this.app.getSettings().autoResize && this.update();
				}, this.onMouseDown = (e) => {
					if (this.checkTarget(e.target)) {
						let t = this.getMousePos(e.clientX, e.clientY);
						this.app.startUserTouch(t), e.preventDefault();
					}
				}, this.onTouchStart = (e) => {
					if (this.checkTarget(e.target) && e.changedTouches.length > 0) {
						let t = e.changedTouches[0], n = this.getMousePos(t.clientX, t.clientY);
						this.touchPoint = {
							point: n,
							time: Date.now()
						}, setTimeout(() => {
							this.touchPoint !== null && this.app.startUserTouch(n);
						}, this.swipeTimeout), this.app.getSettings().mobileScrollSupport || e.preventDefault();
					}
				}, this.onMouseUp = (e) => {
					let t = this.getMousePos(e.clientX, e.clientY);
					this.app.userStop(t);
				}, this.onMouseMove = (e) => {
					let t = this.getMousePos(e.clientX, e.clientY);
					this.app.userMove(t, !1);
				}, this.onTouchMove = (e) => {
					if (e.changedTouches.length > 0) {
						let t = e.changedTouches[0], n = this.getMousePos(t.clientX, t.clientY);
						this.app.getSettings().mobileScrollSupport ? (this.touchPoint !== null && (Math.abs(this.touchPoint.point.x - n.x) > 10 || this.app.getState() !== "read") && e.cancelable && this.app.userMove(n, !0), this.app.getState() !== "read" && e.preventDefault()) : this.app.userMove(n, !0);
					}
				}, this.onTouchEnd = (e) => {
					if (e.changedTouches.length > 0) {
						let t = e.changedTouches[0], n = this.getMousePos(t.clientX, t.clientY), r = !1;
						if (this.touchPoint !== null) {
							let e = n.x - this.touchPoint.point.x, t = Math.abs(n.y - this.touchPoint.point.y);
							Math.abs(e) > this.swipeDistance && t < 2 * this.swipeDistance && Date.now() - this.touchPoint.time < this.swipeTimeout && (e > 0 ? this.app.flipPrev(this.touchPoint.point.y < this.app.getRender().getRect().height / 2 ? "top" : "bottom") : this.app.flipNext(this.touchPoint.point.y < this.app.getRender().getRect().height / 2 ? "top" : "bottom"), r = !0), this.touchPoint = null;
						}
						this.app.userStop(n, r);
					}
				}, this.parentElement = e, e.classList.add("stf__parent"), e.insertAdjacentHTML("afterbegin", "<div class=\"stf__wrapper\"></div>"), this.wrapper = e.querySelector(".stf__wrapper"), this.app = t;
				let r = this.app.getSettings().usePortrait ? 1 : 2;
				e.style.minWidth = n.minWidth * r + "px", e.style.minHeight = n.minHeight + "px", n.size === "fixed" && (e.style.minWidth = n.width * r + "px", e.style.minHeight = n.height + "px"), n.autoSize && (e.style.width = "100%", e.style.maxWidth = 2 * n.maxWidth + "px"), e.style.display = "block", window.addEventListener("resize", this.onResize, !1), this.swipeDistance = n.swipeDistance;
			}
			destroy() {
				this.touchPoint = null, this.removeHandlers(), this.distElement.remove(), this.wrapper.remove();
			}
			getDistElement() {
				return this.distElement;
			}
			getWrapper() {
				return this.wrapper;
			}
			setOrientationStyle(e) {
				this.wrapper.classList.remove("--portrait", "--landscape"), e === "portrait" ? (this.app.getSettings().autoSize && (this.wrapper.style.paddingBottom = this.app.getSettings().height / this.app.getSettings().width * 100 + "%"), this.wrapper.classList.add("--portrait")) : (this.app.getSettings().autoSize && (this.wrapper.style.paddingBottom = this.app.getSettings().height / (2 * this.app.getSettings().width) * 100 + "%"), this.wrapper.classList.add("--landscape")), this.update();
			}
			removeHandlers() {
				window.removeEventListener("resize", this.onResize), this.distElement.removeEventListener("mousedown", this.onMouseDown), this.distElement.removeEventListener("touchstart", this.onTouchStart), window.removeEventListener("mousemove", this.onMouseMove), window.removeEventListener("touchmove", this.onTouchMove), window.removeEventListener("mouseup", this.onMouseUp), window.removeEventListener("touchend", this.onTouchEnd);
			}
			setHandlers() {
				window.addEventListener("resize", this.onResize, !1), this.app.getSettings().useMouseEvents && (this.distElement.addEventListener("mousedown", this.onMouseDown), this.distElement.addEventListener("touchstart", this.onTouchStart), window.addEventListener("mousemove", this.onMouseMove), window.addEventListener("touchmove", this.onTouchMove, { passive: !this.app.getSettings().mobileScrollSupport }), window.addEventListener("mouseup", this.onMouseUp), window.addEventListener("touchend", this.onTouchEnd));
			}
			getMousePos(e, t) {
				let n = this.distElement.getBoundingClientRect();
				return {
					x: e - n.left,
					y: t - n.top
				};
			}
			checkTarget(e) {
				return !this.app.getSettings().clickEventForward || !["a", "button"].includes(e.tagName.toLowerCase());
			}
		}
		class p extends f {
			constructor(e, t, n, r) {
				super(e, t, n), this.wrapper.insertAdjacentHTML("afterbegin", "<div class=\"stf__block\"></div>"), this.distElement = e.querySelector(".stf__block"), this.items = r;
				for (let e of r) this.distElement.appendChild(e);
				this.setHandlers();
			}
			clear() {
				for (let e of this.items) this.parentElement.appendChild(e);
			}
			updateItems(e) {
				this.removeHandlers(), this.distElement.innerHTML = "";
				for (let t of e) this.distElement.appendChild(t);
				this.items = e, this.setHandlers();
			}
			update() {
				this.app.getRender().update();
			}
		}
		class m extends f {
			constructor(e, t, n) {
				super(e, t, n), this.wrapper.innerHTML = "<canvas class=\"stf__canvas\"></canvas>", this.canvas = e.querySelectorAll("canvas")[0], this.distElement = this.canvas, this.resizeCanvas(), this.setHandlers();
			}
			resizeCanvas() {
				let e = getComputedStyle(this.canvas), t = parseInt(e.getPropertyValue("width"), 10), n = parseInt(e.getPropertyValue("height"), 10);
				this.canvas.width = t, this.canvas.height = n;
			}
			getCanvas() {
				return this.canvas;
			}
			update() {
				this.resizeCanvas(), this.app.getRender().update();
			}
		}
		class h extends u {
			constructor(e, t, n) {
				super(e, t), this.outerShadow = null, this.innerShadow = null, this.hardShadow = null, this.hardInnerShadow = null, this.element = n, this.createShadows();
			}
			createShadows() {
				this.element.insertAdjacentHTML("beforeend", "<div class=\"stf__outerShadow\"></div>\n             <div class=\"stf__innerShadow\"></div>\n             <div class=\"stf__hardShadow\"></div>\n             <div class=\"stf__hardInnerShadow\"></div>"), this.outerShadow = this.element.querySelector(".stf__outerShadow"), this.innerShadow = this.element.querySelector(".stf__innerShadow"), this.hardShadow = this.element.querySelector(".stf__hardShadow"), this.hardInnerShadow = this.element.querySelector(".stf__hardInnerShadow");
			}
			clearShadow() {
				super.clearShadow(), this.outerShadow.style.cssText = "display: none", this.innerShadow.style.cssText = "display: none", this.hardShadow.style.cssText = "display: none", this.hardInnerShadow.style.cssText = "display: none";
			}
			reload() {
				this.element.querySelector(".stf__outerShadow") || this.createShadows();
			}
			drawHardInnerShadow() {
				let e = this.getRect(), t = this.shadow.progress > 100 ? 200 - this.shadow.progress : this.shadow.progress, n = (100 - t) * (2.5 * e.pageWidth) / 100 + 20;
				n > e.pageWidth && (n = e.pageWidth);
				let r = `\n            display: block;\n            z-index: ${(this.getSettings().startZIndex + 5).toString(10)};\n            width: ${n}px;\n            height: ${e.height}px;\n            background: linear-gradient(to right,\n                rgba(0, 0, 0, ${this.shadow.opacity * t / 100}) 5%,\n                rgba(0, 0, 0, 0) 100%);\n            left: ${e.left + e.width / 2}px;\n            transform-origin: 0 0;\n        `;
				r += this.getDirection() === 0 && this.shadow.progress > 100 || this.getDirection() === 1 && this.shadow.progress <= 100 ? "transform: translate3d(0, 0, 0);" : "transform: translate3d(0, 0, 0) rotateY(180deg);", this.hardInnerShadow.style.cssText = r;
			}
			drawHardOuterShadow() {
				let e = this.getRect(), t = (100 - (this.shadow.progress > 100 ? 200 - this.shadow.progress : this.shadow.progress)) * (2.5 * e.pageWidth) / 100 + 20;
				t > e.pageWidth && (t = e.pageWidth);
				let n = `\n            display: block;\n            z-index: ${(this.getSettings().startZIndex + 4).toString(10)};\n            width: ${t}px;\n            height: ${e.height}px;\n            background: linear-gradient(to left, rgba(0, 0, 0, ${this.shadow.opacity}) 5%, rgba(0, 0, 0, 0) 100%);\n            left: ${e.left + e.width / 2}px;\n            transform-origin: 0 0;\n        `;
				n += this.getDirection() === 0 && this.shadow.progress > 100 || this.getDirection() === 1 && this.shadow.progress <= 100 ? "transform: translate3d(0, 0, 0) rotateY(180deg);" : "transform: translate3d(0, 0, 0);", this.hardShadow.style.cssText = n;
			}
			drawInnerShadow() {
				let e = this.getRect(), t = 3 * this.shadow.width / 4, n = this.getDirection() === 0 ? t : 0, r = this.getDirection() === 0 ? "to left" : "to right", i = this.convertToGlobal(this.shadow.pos), o = this.shadow.angle + 3 * Math.PI / 2, s = [
					this.pageRect.topLeft,
					this.pageRect.topRight,
					this.pageRect.bottomRight,
					this.pageRect.bottomLeft
				], c = "polygon( ";
				for (let e of s) {
					let t = this.getDirection() === 1 ? {
						x: -e.x + this.shadow.pos.x,
						y: e.y - this.shadow.pos.y
					} : {
						x: e.x - this.shadow.pos.x,
						y: e.y - this.shadow.pos.y
					};
					t = a.GetRotatedPoint(t, {
						x: n,
						y: 100
					}, o), c += t.x + "px " + t.y + "px, ";
				}
				c = c.slice(0, -2), c += ")";
				let l = `\n            display: block;\n            z-index: ${(this.getSettings().startZIndex + 10).toString(10)};\n            width: ${t}px;\n            height: ${2 * e.height}px;\n            background: linear-gradient(${r},\n                rgba(0, 0, 0, ${this.shadow.opacity}) 5%,\n                rgba(0, 0, 0, 0.05) 15%,\n                rgba(0, 0, 0, ${this.shadow.opacity}) 35%,\n                rgba(0, 0, 0, 0) 100%);\n            transform-origin: ${n}px 100px;\n            transform: translate3d(${i.x - n}px, ${i.y - 100}px, 0) rotate(${o}rad);\n            clip-path: ${c};\n            -webkit-clip-path: ${c};\n        `;
				this.innerShadow.style.cssText = l;
			}
			drawOuterShadow() {
				let e = this.getRect(), t = this.convertToGlobal({
					x: this.shadow.pos.x,
					y: this.shadow.pos.y
				}), n = this.shadow.angle + 3 * Math.PI / 2, r = this.getDirection() === 1 ? this.shadow.width : 0, i = this.getDirection() === 0 ? "to right" : "to left", o = [
					{
						x: 0,
						y: 0
					},
					{
						x: e.pageWidth,
						y: 0
					},
					{
						x: e.pageWidth,
						y: e.height
					},
					{
						x: 0,
						y: e.height
					}
				], s = "polygon( ";
				for (let e of o) if (e !== null) {
					let t = this.getDirection() === 1 ? {
						x: -e.x + this.shadow.pos.x,
						y: e.y - this.shadow.pos.y
					} : {
						x: e.x - this.shadow.pos.x,
						y: e.y - this.shadow.pos.y
					};
					t = a.GetRotatedPoint(t, {
						x: r,
						y: 100
					}, n), s += t.x + "px " + t.y + "px, ";
				}
				s = s.slice(0, -2), s += ")";
				let c = `\n            display: block;\n            z-index: ${(this.getSettings().startZIndex + 10).toString(10)};\n            width: ${this.shadow.width}px;\n            height: ${2 * e.height}px;\n            background: linear-gradient(${i}, rgba(0, 0, 0, ${this.shadow.opacity}), rgba(0, 0, 0, 0));\n            transform-origin: ${r}px 100px;\n            transform: translate3d(${t.x - r}px, ${t.y - 100}px, 0) rotate(${n}rad);\n            clip-path: ${s};\n            -webkit-clip-path: ${s};\n        `;
				this.outerShadow.style.cssText = c;
			}
			drawLeftPage() {
				this.orientation !== "portrait" && this.leftPage !== null && (this.direction === 1 && this.flippingPage !== null && this.flippingPage.getDrawingDensity() === "hard" ? (this.leftPage.getElement().style.zIndex = (this.getSettings().startZIndex + 5).toString(10), this.leftPage.setHardDrawingAngle(180 + this.flippingPage.getHardAngle()), this.leftPage.draw(this.flippingPage.getDrawingDensity())) : this.leftPage.simpleDraw(0));
			}
			drawRightPage() {
				this.rightPage !== null && (this.direction === 0 && this.flippingPage !== null && this.flippingPage.getDrawingDensity() === "hard" ? (this.rightPage.getElement().style.zIndex = (this.getSettings().startZIndex + 5).toString(10), this.rightPage.setHardDrawingAngle(180 + this.flippingPage.getHardAngle()), this.rightPage.draw(this.flippingPage.getDrawingDensity())) : this.rightPage.simpleDraw(1));
			}
			drawBottomPage() {
				if (this.bottomPage === null) return;
				let e = this.flippingPage == null ? null : this.flippingPage.getDrawingDensity();
				this.orientation === "portrait" && this.direction === 1 || (this.bottomPage.getElement().style.zIndex = (this.getSettings().startZIndex + 3).toString(10), this.bottomPage.draw(e));
			}
			drawFrame() {
				this.clear(), this.drawLeftPage(), this.drawRightPage(), this.drawBottomPage(), this.flippingPage != null && (this.flippingPage.getElement().style.zIndex = (this.getSettings().startZIndex + 5).toString(10), this.flippingPage.draw()), this.shadow != null && this.flippingPage !== null && (this.flippingPage.getDrawingDensity() === "soft" ? (this.drawOuterShadow(), this.drawInnerShadow()) : (this.drawHardOuterShadow(), this.drawHardInnerShadow()));
			}
			clear() {
				for (let e of this.app.getPageCollection().getPages()) e !== this.leftPage && e !== this.rightPage && e !== this.flippingPage && e !== this.bottomPage && (e.getElement().style.cssText = "display: none"), e.getTemporaryCopy() !== this.flippingPage && e.hideTemporaryCopy();
			}
			update() {
				super.update(), this.rightPage !== null && this.rightPage.setOrientation(1), this.leftPage !== null && this.leftPage.setOrientation(0);
			}
		}
		class g {
			constructor() {
				this._default = {
					startPage: 0,
					size: "fixed",
					width: 0,
					height: 0,
					minWidth: 0,
					maxWidth: 0,
					minHeight: 0,
					maxHeight: 0,
					drawShadow: !0,
					flippingTime: 1e3,
					usePortrait: !0,
					startZIndex: 0,
					autoSize: !0,
					maxShadowOpacity: 1,
					showCover: !1,
					mobileScrollSupport: !0,
					swipeDistance: 30,
					clickEventForward: !0,
					useMouseEvents: !0,
					showPageCorners: !0,
					disableFlipByClick: !1
				};
			}
			getSettings(e) {
				let t = this._default;
				if (Object.assign(t, e), t.size !== "stretch" && t.size !== "fixed") throw Error("Invalid size type. Available only \"fixed\" and \"stretch\" value");
				if (t.width <= 0 || t.height <= 0) throw Error("Invalid width or height");
				if (t.flippingTime <= 0) throw Error("Invalid flipping time");
				return t.size === "stretch" ? (t.minWidth <= 0 && (t.minWidth = 100), t.maxWidth < t.minWidth && (t.maxWidth = 2e3), t.minHeight <= 0 && (t.minHeight = 100), t.maxHeight < t.minHeight && (t.maxHeight = 2e3)) : (t.minWidth = t.width, t.maxWidth = t.width, t.minHeight = t.height, t.maxHeight = t.height), t;
			}
		}
		(function(e, t) {
			t === void 0 && (t = {});
			var n = t.insertAt;
			if (e && typeof document < "u") {
				var r = document.head || document.getElementsByTagName("head")[0], i = document.createElement("style");
				i.type = "text/css", n === "top" && r.firstChild ? r.insertBefore(i, r.firstChild) : r.appendChild(i), i.styleSheet ? i.styleSheet.cssText = e : i.appendChild(document.createTextNode(e));
			}
		})(".stf__parent {\n  position: relative;\n  display: block;\n  box-sizing: border-box;\n  transform: translateZ(0);\n\n  -ms-touch-action: pan-y;\n  touch-action: pan-y;\n}\n\n.sft__wrapper {\n  position: relative;\n  width: 100%;\n  box-sizing: border-box;\n}\n\n.stf__parent canvas {\n  position: absolute;\n  width: 100%;\n  height: 100%;\n  left: 0;\n  top: 0;\n}\n\n.stf__block {\n  position: absolute;\n  width: 100%;\n  height: 100%;\n  box-sizing: border-box;\n  perspective: 2000px;\n}\n\n.stf__item {\n  display: none;\n  position: absolute;\n  transform-style: preserve-3d;\n}\n\n.stf__outerShadow {\n  position: absolute;\n  left: 0;\n  top: 0;\n}\n\n.stf__innerShadow {\n  position: absolute;\n  left: 0;\n  top: 0;\n}\n\n.stf__hardShadow {\n  position: absolute;\n  left: 0;\n  top: 0;\n}\n\n.stf__hardInnerShadow {\n  position: absolute;\n  left: 0;\n  top: 0;\n}"), e.PageFlip = class extends class {
			constructor() {
				this.events = /* @__PURE__ */ new Map();
			}
			on(e, t) {
				return this.events.has(e) ? this.events.get(e).push(t) : this.events.set(e, [t]), this;
			}
			off(e) {
				this.events.delete(e);
			}
			trigger(e, t, n = null) {
				if (this.events.has(e)) for (let r of this.events.get(e)) r({
					data: n,
					object: t
				});
			}
		} {
			constructor(e, t) {
				super(), this.isUserTouch = !1, this.isUserMove = !1, this.setting = null, this.pages = null, this.setting = new g().getSettings(t), this.block = e;
			}
			destroy() {
				this.__studioDestroyed = !0, this.render && this.render.stop(), this.ui && this.ui.destroy(), this.pages && this.pages.destroy(), this.block.remove();
			}
			update() {
				this.render.update(), this.pages.show();
			}
			loadFromImages(e) {
				this.ui = new m(this.block, this, this.setting);
				let t = this.ui.getCanvas();
				this.render = new d(this, this.setting, t), this.flipController = new l(this.render, this), this.pages = new i(this, this.render, e), this.pages.load(), this.render.start(), this.pages.show(this.setting.startPage), setTimeout(() => {
					this.__studioDestroyed || (this.ui.update(), this.trigger("init", this, {
						page: this.setting.startPage,
						mode: this.render.getOrientation()
					}));
				}, 1);
			}
			loadFromHTML(e) {
				this.ui = new p(this.block, this, this.setting, e), this.render = new h(this, this.setting, this.ui.getDistElement()), this.flipController = new l(this.render, this), this.pages = new s(this, this.render, this.ui.getDistElement(), e), this.pages.load(), this.render.start(), this.pages.show(this.setting.startPage), setTimeout(() => {
					this.__studioDestroyed || (this.ui.update(), this.trigger("init", this, {
						page: this.setting.startPage,
						mode: this.render.getOrientation()
					}));
				}, 1);
			}
			updateFromImages(e) {
				let t = this.pages.getCurrentPageIndex();
				this.pages.destroy(), this.pages = new i(this, this.render, e), this.pages.load(), this.pages.show(t), this.trigger("update", this, {
					page: t,
					mode: this.render.getOrientation()
				});
			}
			updateFromHtml(e) {
				let t = this.pages.getCurrentPageIndex();
				this.pages.destroy(), this.pages = new s(this, this.render, this.ui.getDistElement(), e), this.pages.load(), this.ui.updateItems(e), this.render.reload(), this.pages.show(t), this.trigger("update", this, {
					page: t,
					mode: this.render.getOrientation()
				});
			}
			clear() {
				this.pages.destroy(), this.ui.clear();
			}
			turnToPrevPage() {
				this.pages.showPrev();
			}
			turnToNextPage() {
				this.pages.showNext();
			}
			turnToPage(e) {
				this.pages.show(e);
			}
			flipNext(e = "top") {
				this.flipController.flipNext(e);
			}
			flipPrev(e = "top") {
				this.flipController.flipPrev(e);
			}
			flip(e, t = "top") {
				this.flipController.flipToPage(e, t);
			}
			updateState(e) {
				this.trigger("changeState", this, e);
			}
			updatePageIndex(e) {
				this.trigger("flip", this, e);
			}
			updateOrientation(e) {
				this.ui.setOrientationStyle(e), this.update(), this.trigger("changeOrientation", this, e);
			}
			getPageCount() {
				return this.pages.getPageCount();
			}
			getCurrentPageIndex() {
				return this.pages.getCurrentPageIndex();
			}
			getPage(e) {
				return this.pages.getPage(e);
			}
			getRender() {
				return this.render;
			}
			getFlipController() {
				return this.flipController;
			}
			getOrientation() {
				return this.render.getOrientation();
			}
			getBoundsRect() {
				return this.render.getRect();
			}
			getSettings() {
				return this.setting;
			}
			getUI() {
				return this.ui;
			}
			getState() {
				return this.flipController.getState();
			}
			getPageCollection() {
				return this.pages;
			}
			startUserTouch(e) {
				this.mousePosition = e, this.isUserTouch = !0, this.isUserMove = !1;
			}
			userMove(e, t) {
				this.isUserTouch || t || !this.setting.showPageCorners ? this.isUserTouch && a.GetDistanceBetweenTwoPoint(this.mousePosition, e) > 5 && (this.isUserMove = !0, this.flipController.fold(e)) : this.flipController.showCorner(e);
			}
			userStop(e, t = !1) {
				this.isUserTouch && (this.isUserTouch = !1, t || (this.isUserMove ? this.flipController.stopMove() : this.flipController.flip(e)));
			}
		}, Object.defineProperty(e, "__esModule", { value: !0 });
	}));
})))(), Qs = class {
	base;
	entries = /* @__PURE__ */ new Map();
	constructor(e) {
		this.base = e;
	}
	get(e) {
		let t = this.entries.get(e);
		if (t) return t.pending;
		let n = new AbortController(), r = {
			abort: n,
			pending: Promise.resolve(""),
			url: void 0
		};
		return r.pending = (async () => {
			let t = await fetch(new URL(e, this.base), { signal: n.signal });
			if (!t.ok) throw Error(`Cannot load ${e} (${t.status}). Reopen the project or rebuild its page images.`);
			let i = URL.createObjectURL(await t.blob());
			r.url = i;
			let a = new Image();
			a.src = i;
			try {
				await a.decode();
			} catch {
				throw URL.revokeObjectURL(i), Error(`Page image ${e} is damaged. Rebuild the PDF.`);
			}
			if (n.signal.aborted) throw URL.revokeObjectURL(i), new DOMException("Cancelled", "AbortError");
			return i;
		})(), this.entries.set(e, r), r.pending.catch(() => {
			this.entries.get(e) === r && this.entries.delete(e);
		}), r.pending;
	}
	retain(e) {
		for (let [t, n] of this.entries) e.has(t) || (n.abort.abort(), n.url && URL.revokeObjectURL(n.url), this.entries.delete(t));
	}
	destroy() {
		this.retain(/* @__PURE__ */ new Set());
	}
};
//#endregion
//#region packages/reader/mapping.ts
function $s(e, t, n, r = !0) {
	let i = Math.max(1, Math.min(t, e));
	if (n === "single" || r && i === 1) return [i];
	let a = r ? i - i % 2 : i - (i - 1) % 2;
	return [a, a + 1].filter((e) => e > 0 && e <= t);
}
function ec(e, t, n, r, i) {
	let a = $s(e, t, n, r);
	return Math.min(t, Math.max(1, i > 0 ? a[a.length - 1] + 1 : a[0] - 1));
}
//#endregion
//#region packages/reader/engine.ts
var tc = class {
	root;
	manifest;
	base;
	state = "loading";
	sourcePage = 1;
	layout = "spread";
	zoom = 1;
	settings;
	mover = document.createElement("div");
	book = document.createElement("div");
	links = document.createElement("div");
	flip;
	images = [];
	sheets = [];
	assets;
	observers = /* @__PURE__ */ new Set();
	abort = new AbortController();
	resizeObserver;
	pending;
	targetPage;
	pendingResize = !1;
	pendingAppearance;
	width = 400;
	height = 560;
	raf = 0;
	gone = !1;
	assetGeneration = 0;
	turnTimeout;
	settle;
	pan = {
		x: 0,
		y: 0
	};
	lastTransform = "";
	pointer;
	pointerIds = /* @__PURE__ */ new Set();
	errorCallback;
	stateCallback;
	constructor(e, t, n, r, i) {
		this.root = e, this.manifest = t, this.base = n, this.settings = { ...t.settings }, this.assets = new Qs(n), this.stateCallback = r, this.errorCallback = i, this.mover.className = "paper-mover", this.book.className = "paper-book", this.links.className = "paper-links", this.mover.append(this.book, this.links), e.append(this.mover), this.resizeObserver = new ResizeObserver(() => {
			this.busy() ? this.pendingResize = !0 : this.flip && this.resize();
		});
	}
	async mount() {
		this.measure();
		let e = this.manifest.pages.map((e) => {
			let t = document.createElement("div");
			t.className = "paper-sheet", t.dataset.sourcePage = String(e.sourcePage), t.dataset.density = "soft", t.setAttribute("aria-hidden", "true");
			let n = document.createElement("img");
			return n.alt = "", n.draggable = !1, n.className = "paper-artwork", t.append(n), this.book.append(t), this.images.push(n), t;
		}), t = document.createElement("div");
		if (t.className = "paper-sheet", t.dataset.virtual = "true", t.setAttribute("aria-hidden", "true"), e.push(t), this.book.append(t), this.sheets = e, await this.prepare(1), !this.gone) {
			this.flip = new Zs.PageFlip(this.book, {
				width: this.width,
				height: this.height,
				size: "fixed",
				autoSize: !1,
				autoResize: !1,
				usePortrait: !0,
				showCover: this.settings.showCoverAlone,
				useMouseEvents: !1,
				showPageCorners: !1,
				flippingTime: this.duration(),
				maxShadowOpacity: this.settings.shadowStrength,
				mobileScrollSupport: !1,
				disableFlipByClick: !1
			}), this.flip.on("changeState", (e) => {
				this.gone || (e.data === "read" ? queueMicrotask(() => {
					this.gone || this.finish();
				}) : this.setState(e.data === "user_fold" ? "dragging" : "settling"));
			}), this.flip.loadFromHTML(e);
			for (let t = 0; t < e.length; t++) this.flip.getPage(t).setDensity("soft");
			this.resizeObserver.observe(this.root), this.bindPointer(), this.setState("idle"), this.updatePresentation(), this.notify(), this.tick();
		}
	}
	setState(e) {
		this.state = e, this.root.dataset.state = e, this.stateCallback(e);
	}
	busy() {
		return this.state === "loading" || this.state === "dragging" || this.state === "settling";
	}
	measure() {
		let e = this.root.getBoundingClientRect();
		this.layout = this.manifest.pageCount === 1 || this.settings.layout === "single" || this.settings.layout === "auto" && e.width < 720 ? "single" : "spread";
		let t = this.manifest.pages[0].aspectRatio, n = Math.max(140, e.width - (this.layout === "single" ? 34 : 120)), r = Math.max(180, e.height - 36);
		this.height = Math.min(r, n / (this.layout === "single" ? 1 : 2) / t), this.width = this.height * t, this.book.style.width = `${this.width * (this.layout === "single" ? 1 : 2)}px`, this.book.style.height = `${this.height}px`, this.mover.style.width = this.book.style.width, this.mover.style.height = this.book.style.height, this.root.dataset.layout = this.layout;
	}
	resize() {
		let e = this.sourcePage;
		this.measure();
		let t = this.flip.getSettings();
		t.width = this.width, t.height = this.height, t.flippingTime = this.duration(), this.flip.update(), this.flip.turnToPage(e - 1), this.updatePresentation(), this.notify(), this.prepare(e).catch((e) => this.fail(e));
	}
	async prepare(e, t = !1) {
		let n = ++this.assetGeneration, r = /* @__PURE__ */ new Set();
		for (let t of [this.sourcePage, e]) for (let e = t - 3; e <= t + 4; e++) e >= 1 && e <= this.manifest.pageCount && r.add(e);
		let i = /* @__PURE__ */ new Set(), a = this.pages, o = await Promise.all([...r].map(async (e) => {
			let n = this.manifest.pages[e - 1], r = t && a.includes(e) ? n.zoomImage : n.image;
			return i.add(r.path), {
				number: e,
				url: await this.assets.get(r.path)
			};
		})).catch((e) => {
			if (n !== this.assetGeneration || this.gone) return null;
			throw e;
		});
		if (o && !this.gone && n === this.assetGeneration && this.state !== "dragging" && this.state !== "settling") {
			for (let e of o) this.images[e.number - 1].src = e.url;
			for (let e = 0; e < this.images.length; e++) r.has(e + 1) || this.images[e].removeAttribute("src");
			this.assets.retain(i);
		}
	}
	get pages() {
		return $s(this.sourcePage, this.manifest.pageCount, this.layout, this.settings.showCoverAlone);
	}
	get reduced() {
		return this.settings.motionPreference === "reduced" || this.settings.motionPreference === "system" && matchMedia("(prefers-reduced-motion: reduce)").matches;
	}
	duration() {
		return this.settings.turnDurationMs / Math.min(1, Math.max(.2, (2 * this.width - this.height / 10) / 1e3));
	}
	next() {
		return this.goTo(ec(this.sourcePage, this.manifest.pageCount, this.layout, this.settings.showCoverAlone, 1));
	}
	previous() {
		return this.goTo(ec(this.sourcePage, this.manifest.pageCount, this.layout, this.settings.showCoverAlone, -1));
	}
	async goTo(e) {
		if (e = Math.max(1, Math.min(this.manifest.pageCount, Math.round(e))), !this.gone && this.state !== "error" && Number.isFinite(e) && this.manifest.pageCount !== 1) {
			if (this.busy()) {
				this.pending = e;
				return;
			}
			if (this.pages.includes(e)) {
				this.sourcePage = e, this.notify();
				return;
			}
			try {
				if (this.zoom !== 1 && await this.setZoom(1), this.setState("loading"), await this.prepare(e), this.gone) return;
				if (this.targetPage = e, this.reduced) {
					this.flip.turnToPage(e - 1), this.sourcePage = e, await this.finish();
					return;
				}
				this.setState("settling"), await new Promise((t) => {
					this.settle = t, this.flip.flip(e - 1, "bottom"), this.turnTimeout = setTimeout(() => this.fail(/* @__PURE__ */ Error("The page-turn renderer did not settle. Retry the reader to restore this book.")), this.settings.turnDurationMs * 2 + 3e3);
				});
			} catch (e) {
				this.fail(e);
			}
		}
	}
	async finish() {
		if (this.gone) return;
		clearTimeout(this.turnTimeout);
		let e = Math.min(this.manifest.pageCount, this.flip.getCurrentPageIndex() + 1);
		if (this.sourcePage = this.targetPage && $s(e, this.manifest.pageCount, this.layout, this.settings.showCoverAlone).includes(this.targetPage) ? this.targetPage : e, this.targetPage = void 0, this.setState(this.zoom > 1 ? "zoomed" : "idle"), this.updatePresentation(), this.notify(), this.settle?.(), this.settle = void 0, this.pendingAppearance) {
			let e = this.pendingAppearance;
			this.pendingAppearance = void 0, await this.updateAppearance(e);
		}
		this.pendingResize && (this.pendingResize = !1, this.resize());
		let t = this.pending;
		this.pending = void 0, t === void 0 ? this.prepare(this.sourcePage, this.zoom > 1).catch((e) => this.fail(e)) : this.goTo(t);
	}
	notify() {
		this.root.dataset.page = this.pages.join("-");
		for (let e of this.observers) e(this.pages);
	}
	onPageChange(e) {
		return this.observers.add(e), e(this.pages), () => {
			this.observers.delete(e);
		};
	}
	async setLayout(e) {
		await this.updateAppearance({
			...this.settings,
			layout: e
		});
	}
	async updateAppearance(e) {
		if (this.busy()) {
			this.pendingAppearance = e;
			return;
		}
		let t = e.showCoverAlone !== this.settings.showCoverAlone, n = e.layout !== this.settings.layout;
		this.settings = { ...e };
		let r = this.flip.getSettings();
		if (r.flippingTime = this.duration(), r.maxShadowOpacity = e.shadowStrength, t) {
			r.showCover = e.showCoverAlone, this.flip.updateFromHtml(this.sheets);
			for (let e = 0; e < this.flip.getPageCount(); e++) this.flip.getPage(e).setDensity("soft");
		}
		t || n ? this.resize() : this.updatePresentation();
	}
	async setZoom(e) {
		if (!this.busy()) {
			this.zoom = e, this.pan = {
				x: 0,
				y: 0
			}, this.setState("loading");
			try {
				await this.prepare(this.sourcePage, e > 1), this.setState(e > 1 ? "zoomed" : "idle"), this.updatePresentation(), this.notify();
			} catch (e) {
				this.fail(e);
			}
		}
	}
	tick = () => {
		this.gone || (this.updateTransform(), this.raf = requestAnimationFrame(this.tick));
	};
	updateTransform() {
		let e = 0, t = (this.flip?.getFlipController())?.getCalculation(), n = this.settings.showCoverAlone && this.sourcePage === 2 && (this.state === "settling" || this.state === "dragging") && t?.getDirection() === 1;
		if (this.sheets[1]?.classList.toggle("--cover-closing-underlay", n), this.layout === "spread" && this.settings.showCoverAlone) {
			let n = 0;
			(this.state === "settling" || this.state === "dragging") && (n = t?.getFlippingProgress() ?? 0), this.sourcePage === 1 ? e = -this.width / 2 * (1 - n / 100) : this.pages[0] === 2 && t?.getDirection() === 1 && n > 0 && (e = -this.width / 2 * n / 100);
		}
		let r = `translate(${e + this.pan.x}px, ${this.pan.y}px) scale(${this.zoom})`;
		r !== this.lastTransform && (this.mover.style.transform = r, this.lastTransform = r);
		let i = this.busy() ? "hidden" : "visible";
		this.links.style.visibility !== i && (this.links.style.visibility = i);
	}
	updatePresentation() {
		this.root.classList.toggle("paper-edges", this.settings.showPageEdges), this.updateTransform(), this.links.replaceChildren();
		for (let e of this.pages) {
			let t = this.manifest.pages[e - 1], n = this.layout === "single" || this.settings.showCoverAlone && e === 1 || this.pages.length > 1 && e === this.pages[1], r = this.layout === "single" ? 0 : n ? this.width : 0, i = Math.min(this.width, this.height * t.aspectRatio), a = i / t.aspectRatio;
			for (let e of t.links) {
				let t = document.createElement("a");
				if (t.className = "paper-link", t.setAttribute("aria-label", e.label || "Document link"), t.style.left = `${r + (this.width - i) / 2 + i * e.x}px`, t.style.top = `${(this.height - a) / 2 + a * e.y}px`, t.style.width = `${i * e.width}px`, t.style.height = `${a * e.height}px`, e.target.type === "external") t.href = e.target.href, t.target = "_blank", t.rel = "noopener noreferrer";
				else {
					let n = e.target.sourcePage;
					t.href = `#page-${n}`, t.addEventListener("click", (e) => {
						e.preventDefault(), this.goTo(n);
					});
				}
				this.links.append(t);
			}
		}
	}
	point(e) {
		let t = this.book.getBoundingClientRect();
		return {
			x: (e.clientX - t.left) / this.zoom,
			y: (e.clientY - t.top) / this.zoom
		};
	}
	bindPointer() {
		let e = { signal: this.abort.signal };
		this.root.addEventListener("pointerdown", (e) => {
			if (e.target.closest("a,button,input,select")) return;
			if (this.pointer) {
				this.pointerIds.add(e.pointerId), this.root.setPointerCapture(e.pointerId), this.cancelGesture(), this.zoom === 1 && this.setZoom(2);
				return;
			}
			if (this.busy() || this.state === "error") return;
			let t = this.point(e), n = this.book.getBoundingClientRect();
			e.clientX < n.left || e.clientX > n.right || e.clientY < n.top || e.clientY > n.bottom || (e.preventDefault(), this.pointerIds.add(e.pointerId), this.root.focus({ preventScroll: !0 }), this.root.setPointerCapture(e.pointerId), this.pointer = {
				id: e.pointerId,
				...t,
				clientX: e.clientX,
				clientY: e.clientY,
				moved: !1,
				started: !1
			});
		}, e), this.root.addEventListener("dragstart", (e) => e.preventDefault(), e), this.root.addEventListener("pointermove", (e) => {
			let t = this.pointer;
			if (!t || t.id !== e.pointerId) return;
			let n = e.clientX - t.clientX, r = e.clientY - t.clientY;
			if (this.zoom > 1) {
				this.pan.x = Math.max(-this.width * this.zoom, Math.min(this.width * this.zoom, this.pan.x + n)), this.pan.y = Math.max(-this.height, Math.min(this.height, this.pan.y + r)), t.clientX = e.clientX, t.clientY = e.clientY;
				return;
			}
			if (!(this.manifest.pageCount < 2 || this.reduced)) {
				if (!t.started && Math.hypot(n, r) > 10) {
					if (Math.abs(r) > Math.abs(n) * 1.7) {
						this.cancelGesture();
						return;
					}
					let e = t.x < this.width * (this.layout === "single" ? .4 : 1);
					if (e && this.pages[0] === 1 || !e && this.pages.at(-1) === this.manifest.pageCount) {
						this.pointer = void 0;
						return;
					}
					if (t.started = !0, t.moved = !0, this.flip.startUserTouch({
						x: t.x,
						y: t.y
					}), !this.flip.getFlipController().start({
						x: t.x,
						y: t.y
					})) {
						this.pointer = void 0;
						return;
					}
				}
				t.started && (e.preventDefault(), this.flip.userMove(this.point(e), !1));
			}
		}, e), this.root.addEventListener("pointerup", (e) => {
			this.pointerIds.delete(e.pointerId);
			let t = this.pointer;
			t && t.id === e.pointerId && (this.pointer = void 0, t.started ? this.flip.userStop(this.point(e), !1) : this.zoom === 1 && Math.abs(e.clientX - t.clientX) > 30 && (e.clientX < t.clientX ? this.next() : this.previous()), this.root.hasPointerCapture(e.pointerId) && this.root.releasePointerCapture(e.pointerId));
		}, e), this.root.addEventListener("pointercancel", () => {
			this.pointerIds.clear(), this.cancelGesture();
		}, e), this.root.addEventListener("lostpointercapture", () => this.cancelGesture(), e), document.addEventListener("visibilitychange", () => {
			document.hidden && this.cancelGesture();
		}, e);
	}
	cancelGesture() {
		let e = this.pointer;
		if (this.pointer = void 0, e?.started) {
			let t = this.flip.getFlipController(), n = t.getCalculation();
			this.flip.userStop({
				x: e.x,
				y: e.y
			}, !0), n && (this.setState("settling"), t.animateFlippingTo(n.getPosition(), {
				x: this.width,
				y: n.getCorner() === "bottom" ? this.height : 0
			}, !1));
		}
	}
	fail(e) {
		this.gone || (clearTimeout(this.turnTimeout), this.setState("error"), this.pending = void 0, this.settle?.(), this.errorCallback(e instanceof Error ? e : Error(String(e))));
	}
	destroy() {
		this.gone = !0, this.assetGeneration++, clearTimeout(this.turnTimeout), cancelAnimationFrame(this.raf), this.abort.abort(), this.resizeObserver.disconnect(), this.assets.destroy(), this.settle?.(), this.flip?.destroy(), this.mover.remove(), this.observers.clear();
	}
};
//#endregion
//#region packages/reader/index.ts
function Q(e, t, n) {
	let r = document.createElement(e);
	return r.className = t, n && (r.textContent = n), r;
}
var nc = {
	previous: "<path d=\"m14 6-6 6 6 6\"/>",
	next: "<path d=\"m10 6 6 6-6 6\"/>",
	grid: "<rect x=\"4\" y=\"4\" width=\"6\" height=\"7\" rx=\"1\"/><rect x=\"14\" y=\"4\" width=\"6\" height=\"7\" rx=\"1\"/><rect x=\"4\" y=\"15\" width=\"6\" height=\"5\" rx=\"1\"/><rect x=\"14\" y=\"15\" width=\"6\" height=\"5\" rx=\"1\"/>",
	search: "<circle cx=\"10.5\" cy=\"10.5\" r=\"6.5\"/><path d=\"m16 16 4 4\"/>",
	zoom: "<circle cx=\"10.5\" cy=\"10.5\" r=\"6.5\"/><path d=\"m16 16 4 4M7 10.5h7M10.5 7v7\"/>",
	reset: "<path d=\"M7 3H3v4m0-4 6 6M17 3h4v4m0-4-6 6M7 21H3v-4m0 4 6-6m8 6h4v-4m0 4-6-6\"/>",
	fullscreen: "<path d=\"M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5\"/>",
	contents: "<path d=\"M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01\"/>"
};
function $(e, t, n, r = "") {
	let i = Q("button", `reader-button ${r}`);
	return i.type = "button", i.title = e, i.setAttribute("aria-label", e), i.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${nc[t]}</svg>`, i.addEventListener("click", n), i;
}
var rc = class {
	engine;
	root = Q("section", "reader");
	stage = Q("div", "reader-stage");
	title = Q("div", "reader-title");
	status = Q("div", "reader-status");
	position = Q("span", "reader-position");
	input = Q("input", "reader-page-input");
	panel = Q("aside", "reader-panel");
	toolbar = Q("div", "reader-toolbar");
	previous;
	next;
	zoom;
	panelMode = "";
	abort = new AbortController();
	base;
	searchSequence = 0;
	manifest;
	constructor(e, t, n) {
		this.manifest = Js.parse(t), this.base = new URL(n, location.href), this.root.setAttribute("aria-label", `${t.title} flipbook`), this.stage.tabIndex = 0, this.stage.setAttribute("aria-label", "Flipbook pages. Use arrow keys to turn, plus to zoom, Escape to reset."), this.stage.dataset.testid = "book-stage", this.title.textContent = t.title, this.status.setAttribute("role", "status"), this.status.setAttribute("aria-live", "polite"), this.previous = $("Previous page", "previous", () => {
			this.engine.previous();
		}, "reader-arrow reader-arrow-left"), this.next = $("Next page", "next", () => {
			this.engine.next();
		}, "reader-arrow reader-arrow-right"), this.input.type = "number", this.input.min = "1", this.input.max = String(t.pageCount), this.input.value = "1", this.input.setAttribute("aria-label", "Go to page");
		let r = Q("form", "reader-page-form");
		r.append(this.input, Q("span", "", `/ ${t.pageCount}`)), r.addEventListener("submit", (e) => {
			e.preventDefault(), this.engine.goTo(Number(this.input.value)), this.stage.focus();
		}), this.zoom = $("Zoom in", "zoom", () => {
			this.engine.setZoom(this.engine.zoom > 1 ? 1 : 2);
		}), this.toolbar.setAttribute("role", "toolbar"), this.toolbar.setAttribute("aria-label", "Reader controls"), this.toolbar.append($("Thumbnails", "grid", () => this.togglePanel("thumbnails")), $("Search text", "search", () => this.togglePanel("search")), $("Contents", "contents", () => this.togglePanel("contents")), Q("span", "reader-divider"), r, Q("span", "reader-divider"), this.zoom, $("Reset view", "reset", () => {
			this.engine.setZoom(1);
		}), $("Fullscreen", "fullscreen", () => {
			(document.fullscreenElement ? document.exitFullscreen() : this.root.requestFullscreen()).catch(() => {
				this.status.textContent = "Fullscreen is unavailable in this browser.";
			});
		})), this.position.setAttribute("aria-live", "polite"), this.panel.hidden = !0;
		let i = Q("div", "reader-footer");
		i.append(this.position, this.toolbar, Q("div", "reader-hint", "Drag a corner · ← → to turn")), this.root.append(this.title, this.stage, this.previous, this.next, this.panel, this.status, i), e.replaceChildren(this.root), this.stage.addEventListener("keydown", (e) => {
			e.target.closest("input,textarea,select,[contenteditable],a,button") || e.ctrlKey || e.metaKey || e.altKey || (e.key === "ArrowRight" ? (e.preventDefault(), this.engine.next()) : e.key === "ArrowLeft" ? (e.preventDefault(), this.engine.previous()) : e.key === "Home" ? (e.preventDefault(), this.engine.goTo(1)) : e.key === "End" ? (e.preventDefault(), this.engine.goTo(t.pageCount)) : e.key === "+" || e.key === "=" ? (e.preventDefault(), this.engine.setZoom(2)) : e.key === "Escape" && this.engine.setZoom(1));
		}, { signal: this.abort.signal }), this.applyAppearance(t.settings);
	}
	async mount() {
		this.engine = new tc(this.stage, this.manifest, this.base, (e) => {
			this.root.dataset.state = e, this.status.textContent = e === "loading" ? "Preparing page images…" : e === "zoomed" ? "200% · Drag to pan. Reset or turn to return to fit." : "", this.zoom?.setAttribute("aria-label", e === "zoomed" ? "Zoom out" : "Zoom in");
		}, (e) => this.showError(e)), this.engine.onPageChange((e) => {
			this.input.value = String(this.engine.sourcePage), this.position.textContent = `${e.length > 1 ? "Pages" : "Page"} ${e.join("–")} of ${this.manifest.pageCount}`, this.previous.disabled = e[0] === 1, this.next.disabled = e[e.length - 1] === this.manifest.pageCount;
		});
		try {
			await this.engine.mount();
		} catch (e) {
			this.showError(e instanceof Error ? e : Error(String(e)));
		}
		return this;
	}
	showError(e) {
		this.root.dataset.state = "error", this.status.replaceChildren(Q("span", "", e.message));
		let t = Q("button", "reader-retry", "Retry reader");
		t.addEventListener("click", () => {
			this.engine.destroy(), this.status.replaceChildren(), this.mount();
		}), this.status.append(t), this.previous.disabled = !0, this.next.disabled = !0;
	}
	async updateAppearance(e, t) {
		this.manifest.settings = e, t && (this.title.textContent = t, this.manifest.title = t), this.applyAppearance(e), await this.engine.updateAppearance(e);
	}
	applyAppearance(e) {
		this.root.style.backgroundColor = e.backgroundColor, this.root.style.backgroundImage = e.backgroundImage ? `url("${new URL(e.backgroundImage, this.base).href}")` : "", this.root.dataset.theme = e.toolbarTheme;
	}
	togglePanel(e) {
		if (this.panelMode = this.panelMode === e ? "" : e, this.panel.hidden = !this.panelMode, this.searchSequence++, this.panel.replaceChildren(), !this.panelMode) return;
		let t = Q("div", "reader-panel-heading");
		t.append(Q("strong", "", e === "thumbnails" ? "Pages" : e === "search" ? "Find in this book" : "Contents"));
		let n = Q("button", "reader-button", "×");
		if (n.setAttribute("aria-label", "Close reader panel"), n.addEventListener("click", () => this.togglePanel(e)), t.append(n), this.panel.append(t), e === "thumbnails") {
			let t = Q("div", "reader-thumbnails");
			for (let n of this.manifest.pages) {
				let r = Q("button", "reader-thumbnail");
				r.setAttribute("aria-label", `Open page ${n.sourcePage}`);
				let i = Q("img", "");
				i.loading = "lazy", i.src = new URL(n.thumbnail.path, this.base).href, i.alt = "", r.append(i, Q("span", "", String(n.sourcePage))), r.addEventListener("click", () => {
					this.engine.goTo(n.sourcePage), this.togglePanel(e);
				}), t.append(r);
			}
			this.panel.append(t);
		} else if (e === "contents") {
			this.manifest.outline.length || this.panel.append(Q("p", "", "This PDF has no available bookmarks."));
			for (let e of this.manifest.outline) this.result(e.title, e.sourcePage, this.panel);
		} else {
			let e = Q("input", "reader-search");
			e.type = "search", e.placeholder = "Search words…", e.setAttribute("aria-label", "Search this book");
			let t = this.manifest.pages.filter((e) => e.textPath).length;
			this.panel.append(e, Q("p", "reader-search-coverage", `Extracted text available on ${t} of ${this.manifest.pageCount} pages. Scanned text is not searched; no OCR.`));
			let n = Q("div", "reader-search-results");
			this.panel.append(n), e.addEventListener("input", () => {
				this.search(e.value, n);
			}), e.focus();
		}
	}
	result(e, t, n) {
		let r = Q("button", "reader-result");
		r.append(Q("span", "", e), Q("small", "", `Page ${t}`)), r.addEventListener("click", () => {
			this.engine.goTo(t);
		}), n.append(r);
	}
	async search(e, t) {
		let n = ++this.searchSequence;
		if (t.replaceChildren(), e.trim().length < 2) return;
		t.textContent = "Searching…";
		let r = 0;
		try {
			for (let i of this.manifest.pages) {
				if (n !== this.searchSequence) return;
				if (!i.textPath) continue;
				let a = await fetch(new URL(i.textPath, this.base), { signal: this.abort.signal });
				if (!a.ok) throw Error("Some search data is unavailable. Rebuild this project.");
				let o = await a.json(), s = o.text.toLocaleLowerCase().indexOf(e.toLocaleLowerCase());
				if (n !== this.searchSequence) return;
				s >= 0 && (r || t.replaceChildren(), this.result(o.text.slice(Math.max(0, s - 36), s + e.length + 72), i.sourcePage, t), r++);
			}
			r || (t.textContent = "No matching extracted text.");
		} catch (e) {
			this.abort.signal.aborted || (t.textContent = e instanceof Error ? e.message : "Search failed.");
		}
	}
	destroy() {
		this.searchSequence++, this.abort.abort(), this.engine?.destroy(), this.root.remove();
	}
};
async function ic(e, t, n) {
	return new rc(e, t, n).mount();
}
//#endregion
//#region packages/reader/export.ts
var ac = document.getElementById("reader") ?? document.body;
ac.style.height = "100dvh";
async function oc() {
	if (location.protocol === "file:") throw Error("Serve this folder over HTTP. See README.txt for the offline local-server command.");
	let e = new URL("manifest.json", location.href), t = await fetch(e);
	if (!t.ok) throw Error("Cannot load manifest.json. Check that the complete export folder is present.");
	let n = Js.parse(await t.json());
	document.title = n.title, await ic(ac, n, new URL(".", e));
}
oc().catch((e) => {
	ac.textContent = `Unable to open flipbook: ${e instanceof Error ? e.message : String(e)}`;
});
//#endregion

//# sourceMappingURL=reader.js.map