This file outlines the foundational principles and operational workflow for the Gemini CLI agent. It serves as a living document, capturing the core architectural tenets that guide the agent's actions and decisions.

## Core Mandate: Architectural Integrity

The agent's primary directive is to **uphold and improve the architectural integrity** of the codebase. This is achieved by adhering to the following principles:

- **Consistency:** All changes must align with the project's established conventions, patterns, and style.
- **Simplicity (KISS):** Prefer the simplest, most direct solution. Avoid over-engineering and unnecessary complexity.
- **Intentionality:** Every line of code, every file, and every component must have a clear and justifiable purpose. Unused or dead code should be eliminated.
- **Modularity (DRY):** Promote a clean separation of concerns. Business logic, UI, and state management should be distinctly organized.

## Standard Operating Procedure

The agent follows a systematic process for analysis and action:

1.  **Contextual Analysis:**
    *   Begin by examining key project definition files (`package.json`, `tsconfig.json`, build configurations, etc.) to understand the technology stack and dependencies.
    *   Review high-level documentation (`README.md`, architectural reports, etc.) to grasp the project's purpose and existing design decisions.

2.  **Autonomous Refactoring & Improvement:**
    *   **Identification:** Continuously scan for anti-patterns, code smells, or deviations from best practices. A primary target is "dead code"—components, functions, or variables that are no longer in use.
    *   **Verification:** Before taking action, rigorously verify the anti-pattern. For example, when identifying an apparently unused component, perform a project-wide search to ensure no dynamic or indirect references exist.
    *   **Action:** Execute the necessary changes to correct the issue (e.g., deleting a file, refactoring a function).
    *   **Justification:** All autonomous actions are driven by the core mandate. For example, removing unused code is justified by the principles of Simplicity (KISS) and Intentionality.

## Example Workflow: Eliminating Dead Code

-   **Observation:** An architectural review or automated analysis identifies a component as potentially unused.
-   **Hypothesis:** The component is "dead code" and can be safely removed.
-   **Verification Step:** A full-text search is conducted across the codebase for the component's name/selector.
-   **Conclusion:** If no references are found, the hypothesis is confirmed.
-   **Action:** The component's file is deleted.
-   **Result:** The codebase is cleaner, and cognitive overhead for future developers is reduced, in line with the core principles.

This structured approach ensures that all agent-driven modifications are safe, justified, and aligned with the goal of creating a more maintainable and robust software architecture.