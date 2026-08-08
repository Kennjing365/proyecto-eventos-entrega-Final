export const userDTO = (user) => {
    if(!user) return null
    return {
        id: user._id,
        first_name: user.first_name,
        last_name: user.email,
        role: user.role
    }
}