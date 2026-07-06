import React, { useMemo, useState, useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import {
  UiContainer,
  UiNode,
  UiNodeInputAttributes,
  UiNodeAnchorAttributes,
  UiNodeImageAttributes,
  UiNodeTextAttributes,
} from "@ory/kratos-client";

export function getUiTextString(text: any): string {
  if (!text) return "";
  if (typeof text === "string") return text;
  if (typeof text === "object" && "text" in text) return text.text;
  return String(text);
}

interface KratosFormProps {
  ui: UiContainer;
  submitFlow: (values: any) => Promise<any>;
}

export function KratosForm({ ui, submitFlow }: KratosFormProps) {
  const [submitter, setSubmitter] = useState<{name: string, value: string} | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const initialValues = useMemo(() => {
    const values: Record<string, any> = {};
    ui.nodes.forEach(node => {
      if ('name' in node.attributes) {
        const attrs = node.attributes as any;
        if (attrs.type === 'checkbox') {
          values[attrs.name] = !!attrs.value;
        } else {
          values[attrs.name] = attrs.value || '';
        }
      }
    });
    return values;
  }, [ui.nodes]);

  const form = useForm({
    defaultValues: initialValues,
    onSubmit: async ({ value }) => {
      setGlobalError(null);
      const body = { ...value };
      if (submitter) {
        body[submitter.name] = submitter.value;
      }
      
      try {
        await submitFlow(body);
      } catch (err: any) {
        setGlobalError(err.message || "An unexpected error occurred");
      }
    },
  });

  // Re-sync values if Kratos flow updates (e.g. after a validation error)
  useEffect(() => {
    // If there's a validation error, the flow will update with new nodes and messages.
    // In that case, we should update the form's values (like a new CSRF token).
    // React Form provides form.reset() to re-initialize from defaultValues.
    form.reset(initialValues);
  }, [initialValues]);

  return (
    <form
      action={ui.action}
      method={ui.method}
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="kratos-form"
    >
      {/* Global messages (e.g. invalid credentials or confirmation messages) */}
      {ui.messages && ui.messages.length > 0 && (
        <div className="kratos-global-messages">
          {ui.messages.map((message) => (
            <div key={message.id} className={`kratos-message kratos-message-${message.type}`}>
              {message.text}
            </div>
          ))}
        </div>
      )}

      {globalError && <div className="kratos-error-banner">{globalError}</div>}

      {/* Render form nodes */}
      <div className="kratos-form-nodes">
        {ui.nodes.map((node, index) => (
          <KratosNode 
            key={index} 
            node={node} 
            form={form} 
            onRegisterSubmitter={(name, value) => setSubmitter({name, value})} 
          />
        ))}
      </div>
    </form>
  );
}

interface KratosNodeProps {
  node: UiNode;
  form: any;
  onRegisterSubmitter: (name: string, value: string) => void;
}

export function KratosNode({ node, form, onRegisterSubmitter }: KratosNodeProps) {
  const attributes = node.attributes;
  const nodeType = attributes.node_type;

  const messages = node.messages?.map((message) => (
    <div key={message.id} className={`kratos-node-message kratos-node-message-${message.type}`}>
      {message.text}
    </div>
  ));

  switch (nodeType) {
    case "input": {
      const inputAttrs = attributes as UiNodeInputAttributes;
      const inputType = inputAttrs.type;

      if (inputType === "hidden") {
        return (
          <form.Field
            name={inputAttrs.name}
            children={(field: any) => (
              <input
                type="hidden"
                name={field.name}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            )}
          />
        );
      }

      const labelText = getUiTextString(node.meta.label) || inputAttrs.name;

      if (inputType === "submit" || inputType === "button") {
        return (
          <div className="kratos-node kratos-node-button">
            <button
              type="submit"
              name={inputAttrs.name}
              value={inputAttrs.value as string || ""}
              disabled={inputAttrs.disabled || form.state.isSubmitting}
              onClick={() => onRegisterSubmitter(inputAttrs.name, inputAttrs.value as string || "")}
            >
              {labelText}
            </button>
            {messages}
          </div>
        );
      }

      if (inputType === "checkbox") {
        return (
          <div className="kratos-node kratos-node-checkbox">
            <form.Field
              name={inputAttrs.name}
              children={(field: any) => (
                <label>
                  <input
                    type="checkbox"
                    name={field.name}
                    checked={!!field.state.value}
                    disabled={inputAttrs.disabled || form.state.isSubmitting}
                    required={inputAttrs.required}
                    onChange={(e) => field.handleChange(e.target.checked)}
                  />
                  <span>{labelText}</span>
                </label>
              )}
            />
            {messages}
          </div>
        );
      }

      return (
        <div className="kratos-node kratos-node-input">
          <label htmlFor={inputAttrs.name}>{labelText}</label>
          <form.Field
            name={inputAttrs.name}
            children={(field: any) => (
              <input
                id={inputAttrs.name}
                type={inputType}
                name={field.name}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                disabled={inputAttrs.disabled || form.state.isSubmitting}
                required={inputAttrs.required}
                placeholder={getUiTextString(node.meta.label)}
              />
            )}
          />
          {messages}
        </div>
      );
    }

    case "a": {
      const anchorAttrs = attributes as UiNodeAnchorAttributes;
      return (
        <div className="kratos-node kratos-node-anchor">
          <a href={anchorAttrs.href} id={anchorAttrs.id}>
            {getUiTextString(node.meta.label) || getUiTextString(anchorAttrs.title) || anchorAttrs.href}
          </a>
          {messages}
        </div>
      );
    }

    case "img": {
      const imgAttrs = attributes as UiNodeImageAttributes;
      return (
        <div className="kratos-node kratos-node-img">
          <img
            src={imgAttrs.src}
            id={imgAttrs.id}
            width={imgAttrs.width}
            height={imgAttrs.height}
            alt={getUiTextString(node.meta.label) || "Image"}
          />
          {messages}
        </div>
      );
    }

    case "text": {
      const textAttrs = attributes as UiNodeTextAttributes;
      return (
        <div className="kratos-node kratos-node-text">
          <p id={textAttrs.id}>{textAttrs.text.text}</p>
          {messages}
        </div>
      );
    }

    default:
      return null;
  }
}
