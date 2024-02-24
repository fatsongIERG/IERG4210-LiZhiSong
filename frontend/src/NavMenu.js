import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const NavMenu = ({ categories }) => {
    const navigate = useNavigate();

    const handleCategoryClick = (catid) => {
        // Navigate to the new route using catid
        navigate(`/category/${catid}`);
        // If you have a way to set the active category in a parent component or context, do it here
    };

    return (
        <aside className="category-menu">
            <ul>
                {categories.map((category) => (
                    <li key={category.catid}>
                        {/* Use category.catid in the to prop and the click handler */}
                        <Link
                          to={`/category/${category.catid}`} // Now the link is to /category/:catid
                          onClick={() => handleCategoryClick(category.catid)}
                        >
                            {category.name}
                        </Link>
                    </li>
                ))}
            </ul>
        </aside>
    );
};

export default NavMenu;
