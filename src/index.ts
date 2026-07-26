export class DependencyCycleError<T> extends Error {
  override readonly name = "DependencyCycleError";
  constructor(readonly nodes: readonly T[]) {
    super("Dependency graph contains a cycle");
  }
}

/** A directed dependency graph with stable topological ordering. */
export class DependencyGraph<T> {
  private readonly nodes = new Map<T, Set<T>>();

  constructor(values: Iterable<T> = []) {
    for (const value of values) this.addNode(value);
  }

  get size(): number {
    return this.nodes.size;
  }

  addNode(value: T): this {
    if (!this.nodes.has(value)) this.nodes.set(value, new Set());
    return this;
  }

  addDependency(value: T, dependency: T): this {
    this.addNode(value).addNode(dependency);
    this.nodes.get(value)?.add(dependency);
    return this;
  }

  has(value: T): boolean {
    return this.nodes.has(value);
  }

  dependenciesOf(value: T): ReadonlySet<T> {
    const dependencies = this.nodes.get(value);
    if (!dependencies) throw new Error("Unknown dependency graph node");
    return new Set(dependencies);
  }

  dependentsOf(value: T): Set<T> {
    if (!this.nodes.has(value))
      throw new Error("Unknown dependency graph node");
    const output = new Set<T>();
    for (const [node, dependencies] of this.nodes) {
      if (dependencies.has(value)) output.add(node);
    }
    return output;
  }

  remove(value: T): boolean {
    if (!this.nodes.delete(value)) return false;
    for (const dependencies of this.nodes.values()) dependencies.delete(value);
    return true;
  }

  topologicalSort(): T[] {
    return this.layers().flat();
  }

  layers(): T[][] {
    const remaining = new Map(
      [...this.nodes].map(([node, dependencies]) => [
        node,
        new Set(dependencies),
      ]),
    );
    const layers: T[][] = [];
    while (remaining.size > 0) {
      const layer = [...remaining]
        .filter(([, dependencies]) => dependencies.size === 0)
        .map(([node]) => node);
      if (layer.length === 0) {
        throw new DependencyCycleError([...remaining.keys()]);
      }
      layers.push(layer);
      for (const node of layer) remaining.delete(node);
      for (const dependencies of remaining.values()) {
        for (const node of layer) dependencies.delete(node);
      }
    }
    return layers;
  }
}
