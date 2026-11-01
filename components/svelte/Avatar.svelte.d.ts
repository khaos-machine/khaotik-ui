/**
 * The first letters of the first two words of the name, else the email's
 * first letter, upper-cased.
 * @param {string} name
 * @param {string} email
 */
export function initials(name: string, email: string): string;
export default Avatar;
type Avatar = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const Avatar: import("svelte").Component<{
    /**
     * The person's name; its first two words give the initials.
     */
    name?: string;
    /**
     * Used for the initial when there is no name.
     */
    email?: string;
    /**
     * The diameter in pixels.
     */
    size?: number;
}, {}, "">;
type Props = {
    /**
     * The person's name; its first two words give the initials.
     */
    name?: string;
    /**
     * Used for the initial when there is no name.
     */
    email?: string;
    /**
     * The diameter in pixels.
     */
    size?: number;
};
