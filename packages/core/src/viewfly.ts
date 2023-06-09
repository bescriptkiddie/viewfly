import { NullInjector, Provider, ReflectiveInjector } from '@tanbo/di'

import { NativeNode, Renderer, RootComponentRef } from './foundation/_api'
import { RootComponent } from './model/root.component'
import { Component, JSXTemplate } from './model/component'

export interface Config {
  providers?: Provider[]
  host: NativeNode,

  root(): JSXTemplate
}

export class Viewfly extends ReflectiveInjector {
  private destroyed = false
  private rootComponent: Component
  constructor(config: Config) {
    super(new NullInjector(), [
      ...(config.providers || []),
      Renderer,
      {
        provide: RootComponentRef,
        useFactory: () => {
          return {
            host: config.host,
            component: this.rootComponent
          }
        }
      }
    ])
    this.rootComponent = this.createRootComponent(config.root)
  }

  start() {
    const renderer = this.get(Renderer)
    renderer.render()
  }

  destroy() {
    const renderer = this.get(Renderer)
    this.destroyed = true
    this.rootComponent.markAsDirtied()
    renderer.destroy()
  }

  private createRootComponent(factory: () => JSXTemplate) {
    return new RootComponent(() => {
      return () => {
        return this.destroyed ? null : factory()
      }
    })
  }
}
